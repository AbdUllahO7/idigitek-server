import ContentElementModel from '../models/ContentElement.model';
import SubSectionModel from '../models/subSection.model';
import { ICreateSubSection, IUpdateSubSection } from '../types/sub.section.types';
import mongoose from 'mongoose';
import SectionItemModel from '../models/sectionItem.model';
import ContentTranslationModel from '../models/ContentTranslation.model';
import { AppError } from '../middleware/errorHandler.middleware';

class SubSectionService {
   /**
     * Create a new subsection
     * @param subsectionData The subsection data to create
     * @returns Promise with the created subsection
     */
    async createSubSection(subsectionData: ICreateSubSection): Promise<ICreateSubSection> {
        try {
            console.log("subsectionData", subsectionData);
            // Check if subsection with this slug already exists
            const existingSubSection = await SubSectionModel.findOne({ slug: subsectionData.slug });
            if (existingSubSection) {
                throw AppError.badRequest(`Subsection with slug '${subsectionData.slug}' already exists`);
            }

            // Check if section item exists
            if (subsectionData.sectionItem) {
                const sectionItemExists = await SectionItemModel.findById(subsectionData.sectionItem);
                if (!sectionItemExists) {
                    throw AppError.notFound(`Section item with ID ${subsectionData.sectionItem} not found`);
                }
                
                // If isMain is true and section is not provided, get section from sectionItem
                if (subsectionData.isMain && !subsectionData.section) {
                    subsectionData.section = sectionItemExists.section;
                }
            }
            
            // If isMain is true, check if other main subsections exist for this section
            if (subsectionData.isMain && subsectionData.section) {
                await this.handleMainSubSection(null, subsectionData.section);
            }

            // Create new subsection
            const subsection = new SubSectionModel({
                name: subsectionData.name,
                description: subsectionData.description,
                slug: subsectionData.slug,
                order: subsectionData.order || 0,
                isActive: subsectionData.isActive !== undefined ? subsectionData.isActive : true,
                sectionItem: subsectionData.sectionItem,
                section: subsectionData.section,
                languages: subsectionData.languages || [],
                isMain: subsectionData.isMain 
            });
            
            await subsection.save();
            
            // Update section item if provided
            if (subsectionData.sectionItem) {
                await SectionItemModel.findByIdAndUpdate(
                    subsectionData.sectionItem,
                    { $addToSet: { subsections: subsection._id } }
                );
            }
            
            return subsection;
        } catch (error) {
            if (error instanceof AppError) throw error;
            if (error.code === 11000) {
                throw AppError.badRequest('Subsection with this slug already exists');
            }
            throw AppError.database('Failed to create subsection', error);
        }
    }

     /**
     * Helper function to handle main subsection logic
     * This unsets isMain flag on other subsections for the same section
     * @param currentSubsectionId ID of the current subsection (null for new subsections)
     * @param sectionId ID of the section
     */
     private async handleMainSubSection(currentSubsectionId: string | null, sectionId: mongoose.Types.ObjectId): Promise<void> {
        try {
            // Create a query to find other main subsections for this section
            const query: any = { 
                section: sectionId,
                isMain: true
            };
            
            // Exclude the current subsection if updating
            if (currentSubsectionId) {
                query._id = { $ne: currentSubsectionId };
            }
            
            // Unset isMain flag on other subsections
            await SubSectionModel.updateMany(query, { $set: { isMain: false } });
        } catch (error) {
            throw AppError.database('Failed to update main subsection status', error);
        }
    }

    
    /**
     * Get all subsections
     * @param activeOnly Whether to return only active subsections
     * @param limit Maximum number of subsections to return
     * @param skip Number of subsections to skip
     * @param includeContentCount Whether to include content element count
     * @returns Promise with array of subsections
     */
    async getAllSubSections(
        activeOnly = true, 
        limit = 100, 
        skip = 0,
        includeContentCount = false
    ): Promise<ICreateSubSection[]> {
        try {
            const query = activeOnly ? { isActive: true } : {};
            
            const subsections = await SubSectionModel.find(query)
                .sort({ order: 1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate({
                    path: 'sectionItem',
                    match: activeOnly ? { isActive: true } : {},
                    options: { sort: { order: 1 } }
                })
                .populate('section')
                .populate('languages');
            
            // Include content element count logic stays the same...
            if (includeContentCount && subsections.length > 0) {
                const subsectionIds = subsections.map(subsection => subsection._id);
                
                // Get counts for each subsection
                const contentCounts = await ContentElementModel.aggregate([
                    { $match: { parent: { $in: subsectionIds }, isActive: activeOnly } },
                    { $group: { _id: '$parent', count: { $sum: 1 } } }
                ]);
                
                // Create a map of subsection ID to count
                const countsMap = contentCounts.reduce((acc, item) => {
                    acc[item._id.toString()] = item.count;
                    return acc;
                }, {} as { [key: string]: number });
                
                // Add count to each subsection
                subsections.forEach(subsection => {
                    const id = subsection._id.toString();
                    (subsection as any).contentCount = countsMap[id] || 0;
                });
            }
            
            return subsections;
        } catch (error) {
            throw AppError.database('Failed to retrieve subsections', error);
        }
    }
    
    
  /**
     * Get subsection by ID
     * @param id The subsection ID
     * @param populateSectionItem Whether to populate section item
     * @param includeContentElements Whether to include content elements
     * @returns Promise with the subsection if found
     */
    async getSubSectionById(
        id: string, 
        populateSectionItem = true,
        includeContentElements = false
    ): Promise<ICreateSubSection> {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw AppError.validation('Invalid subsection ID format');
            }

            const query = SubSectionModel.findById(id);
            
            if (populateSectionItem) {
                query.populate({
                    path: 'sectionItem',
                    populate: {
                        path: 'section'
                    }
                })
                .populate('section')  // Populate the direct section reference
                .populate('languages');
            }
            
            const subsection = await query.exec();
            
            if (!subsection) {
                throw AppError.notFound(`Subsection with ID ${id} not found`);
            }
            
            // If requested, include content elements
            if (includeContentElements) {
                const contentElements = await ContentElementModel.find({
                    parent: id,
                    isActive: true
                }).sort({ order: 1 });
                
                // Add content elements to the result
                (subsection as any).contentElements = contentElements;
            }
            
            return subsection;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw AppError.database('Failed to retrieve subsection', error);
        }
    }

 /**
 * Get subsections by section ID with all content elements and their translations
 * @param sectionId The section ID
 * @param activeOnly Whether to return only active subsections
 * @param limit Maximum number of subsections to return
 * @param skip Number of subsections to skip
 * @returns Promise with array of complete subsections data including elements and translations
 */
async getCompleteSubSectionsBySectionId(
    sectionId: string,
    activeOnly = true,
    limit = 100,
    skip = 0
): Promise<any[]> {
    try {
        if (!mongoose.Types.ObjectId.isValid(sectionId)) {
            throw AppError.validation('Invalid section ID format');
        }

        // Build the query to get subsections
        const query: any = { 
            section: sectionId 
        };
        
        if (activeOnly) {
            query.isActive = true;
        }
        
        // Get subsections with basic population
        const subsections = await SubSectionModel.find(query)
            .sort({ order: 1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate({
                path: 'sectionItem',
                populate: {
                    path: 'section'
                },
                match: activeOnly ? { isActive: true } : {}
            })
            .populate('section')
            .populate('languages');
        
        if (subsections.length === 0) {
            return [];
        }

        // Get all subsection IDs
        const subsectionIds = subsections.map(sub => sub._id);

        // Get all content elements for these subsections
        const contentElements = await ContentElementModel.find({
            parent: { $in: subsectionIds },
            isActive: activeOnly
        }).sort({ order: 1 });

        // Get all element IDs
        const elementIds = contentElements.map(element => element._id);

        // Get all translations for these elements in a single query
        const translations = await ContentTranslationModel.find({
            contentElement: { $in: elementIds },
            isActive: activeOnly
        }).populate('language');

        // Group translations by content element ID
        const translationsByElement: Record<string, any[]> = {};
        
        translations.forEach(translation => {
            const elementId = translation.contentElement.toString();
            if (!translationsByElement[elementId]) {
                translationsByElement[elementId] = [];
            }
            translationsByElement[elementId].push(translation);
        });

        // Group content elements by subsection ID
        const elementsBySubsection: Record<string, any[]> = {};
        
        contentElements.forEach(element => {
            const subsectionId = element.parent.toString();
            if (!elementsBySubsection[subsectionId]) {
                elementsBySubsection[subsectionId] = [];
            }
            
            const elementData = element.toObject();
            const elementId = element._id.toString();
            elementData.translations = translationsByElement[elementId] || [];
            elementsBySubsection[subsectionId].push(elementData);
        });

        // Create complete result with subsections and their elements
        const result = subsections.map(subsection => {
            const subsectionData = subsection.toObject();
            const subsectionId = subsection._id.toString();
            subsectionData.elements = elementsBySubsection[subsectionId] || [];
            return subsectionData;
        });

        return result;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw AppError.database('Failed to retrieve complete subsections by section ID', error);
    }
}

    /**
     * Get main subsection for a given section
     * @param sectionId The section ID
     * @returns Promise with the main subsection for this section, or null if not found
     */
    async getMainSubSectionBySectionId(sectionId: string): Promise<ICreateSubSection | null> {
        try {
            if (!mongoose.Types.ObjectId.isValid(sectionId)) {
                throw AppError.validation('Invalid section ID format');
            }

            const mainSubsection = await SubSectionModel.findOne({
                section: sectionId,
                isMain: true,
                isActive: true
            }).populate({
                path: 'sectionItem',
                populate: {
                    path: 'section'
                }
            })
            .populate('section')
            .populate('languages');
            
            return mainSubsection;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw AppError.database('Failed to retrieve main subsection', error);
        }
    }
    
    /**
     * Get subsection by slug
     * @param slug The subsection slug
     * @param populateSectionItem Whether to populate section item
     * @param includeContentElements Whether to include content elements
     * @returns Promise with the subsection if found
     */
    async getSubSectionBySlug(
        slug: string,
        populateSectionItem = true,
        includeContentElements = false
    ): Promise<ICreateSubSection> {
        try {
            const query = SubSectionModel.findOne({ slug });
            
            if (populateSectionItem) {
                query.populate({
                    path: 'sectionItem',
                    populate: {
                        path: 'section'
                    }
                }).populate('languages');
            }
            
            const subsection = await query.exec();
            
            if (!subsection) {
                throw AppError.notFound(`Subsection with slug ${slug} not found`);
            }
            
            // If requested, include content elements
            if (includeContentElements) {
                const contentElements = await ContentElementModel.find({
                    parent: subsection._id,
                    isActive: true
                }).sort({ order: 1 });
                
                // Add content elements to the result
                (subsection as any).contentElements = contentElements;
            }
            
            return subsection;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw AppError.database('Failed to retrieve subsection', error);
        }
    }
    
    /**
     * Update subsection by ID
     * @param id The subsection ID
     * @param updateData The data to update
     * @returns Promise with the updated subsection
     */
    async updateSubSectionById(id: string, updateData: IUpdateSubSection): Promise<ICreateSubSection> {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw AppError.validation('Invalid subsection ID format');
            }

            const subsection = await SubSectionModel.findById(id);
            
            if (!subsection) {
                throw AppError.notFound(`Subsection with ID ${id} not found`);
            }
            
            // Check slug uniqueness if it's being updated
            if (updateData.slug && updateData.slug !== subsection.slug) {
                const existingWithSlug = await SubSectionModel.findOne({
                    slug: updateData.slug,
                    _id: { $ne: id }
                });
                
                if (existingWithSlug) {
                    throw AppError.badRequest(`Subsection with slug '${updateData.slug}' already exists`);
                }
            }

            // Handle section item update if provided
            if (updateData.sectionItem && updateData.sectionItem.toString() !== subsection.sectionItem.toString()) {
                // Check if new section item exists
                const sectionItemExists = await SectionItemModel.findById(updateData.sectionItem);
                if (!sectionItemExists) {
                    throw AppError.notFound(`Section item with ID ${updateData.sectionItem} not found`);
                }
                
                // Remove from old section item
                await SectionItemModel.findByIdAndUpdate(
                    subsection.sectionItem,
                    { $pull: { subsections: subsection._id } }
                );
                
                // Add to new section item
                await SectionItemModel.findByIdAndUpdate(
                    updateData.sectionItem,
                    { $addToSet: { subsections: subsection._id } }
                );
            }
            
            // Update the subsection
            const updatedSubSection = await SubSectionModel.findByIdAndUpdate(
                id,
                { $set: updateData },
                { new: true, runValidators: true }
            ).populate({
                path: 'sectionItem',
                populate: {
                    path: 'section'
                }
            }).populate('languages');
            
            return updatedSubSection;
        } catch (error) {
            if (error instanceof AppError) throw error;
            if (error.code === 11000) {
                throw AppError.badRequest('Subsection with this slug already exists');
            }
            throw AppError.database('Failed to update subsection', error);
        }
    }
    
    /**
     * Delete subsection by ID
     * @param id The subsection ID
     * @param hardDelete Whether to permanently delete
     * @returns Promise with the result of the deletion
     */
    async deleteSubSectionById(id: string, hardDelete = false): Promise<{ success: boolean; message: string }> {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw AppError.validation('Invalid subsection ID format');
            }

            const subsection = await SubSectionModel.findById(id);
            
            if (!subsection) {
                throw AppError.notFound(`Subsection with ID ${id} not found`);
            }

            if (hardDelete) {
                // Check if there are content elements associated with this subsection
                const contentElementsCount = await ContentElementModel.countDocuments({ parent: id });
                if (contentElementsCount > 0) {
                    throw AppError.badRequest(`Cannot hard delete subsection with ${contentElementsCount} associated content elements`);
                }

                // Permanently delete
                await SubSectionModel.findByIdAndDelete(id);
                
                // Remove this subsection from section item
                await SectionItemModel.findByIdAndUpdate(
                    subsection.sectionItem,
                    { $pull: { subsections: id } }
                );
                
                return { success: true, message: 'Subsection deleted successfully' };
            } else {
                // Soft delete
                await SubSectionModel.findByIdAndUpdate(id, { isActive: false });
                
                // Also mark all content elements as inactive
                await ContentElementModel.updateMany(
                    { parent: id },
                    { isActive: false }
                );
                
                return { success: true, message: 'Subsection deactivated successfully' };
            }
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw AppError.database('Failed to delete subsection', error);
        }
    }

    /**
     * Bulk update subsection order
     * @param subsections Array of { id, order } objects
     * @returns Promise with success message
     */
    async updateSubsectionsOrder(subsections: { id: string; order: number }[]): Promise<{ success: boolean; message: string }> {
        try {
            const bulkOps = subsections.map(subsection => ({
                updateOne: {
                    filter: { _id: new mongoose.Types.ObjectId(subsection.id) },
                    update: { $set: { order: subsection.order } }
                }
            }));

            if (bulkOps.length > 0) {
                await SubSectionModel.bulkWrite(bulkOps);
            }

            return { success: true, message: `Updated order for ${subsections.length} subsections` };
        } catch (error) {
            throw AppError.database('Failed to update subsections order', error);
        }
    }
    
    /**
     * Get subsection by ID with all content elements and their translations
     * @param id The subsection ID
     * @param populateSectionItem Whether to populate section item
     * @returns Promise with the complete subsection data including elements and translations
     */
    async getCompleteSubSectionById(
        id: string, 
        populateSectionItem = true
    ): Promise<any> {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw AppError.validation('Invalid subsection ID format');
            }

            // First get the subsection
            const query = SubSectionModel.findById(id);
            
            if (populateSectionItem) {
                query.populate({
                    path: 'sectionItem',
                    populate: {
                        path: 'section'
                    }
                }).populate('languages');
            }
            
            const subsection = await query.exec();
            
            if (!subsection) {
                throw AppError.notFound(`Subsection with ID ${id} not found`);
            }
            
            // Get all content elements for this subsection
            const contentElements = await ContentElementModel.find({
                parent: id,
                isActive: true
            }).sort({ order: 1 });
            
            // Get all element IDs
            const elementIds = contentElements.map(element => element._id);
            
            // Get all translations for these elements in a single query
            const translations = await ContentTranslationModel.find({
                contentElement: { $in: elementIds },
                isActive: true
            }).populate('language');
            
            // Group translations by content element ID
            const translationsByElement: Record<string, any[]> = {};
            
            translations.forEach(translation => {
                const elementId = translation.contentElement.toString();
                if (!translationsByElement[elementId]) {
                    translationsByElement[elementId] = [];
                }
                translationsByElement[elementId].push(translation);
            });
            
            // Add translations to each content element
            const elementsWithTranslations = contentElements.map(element => {
                const elementId = element._id.toString();
                const elementData = element.toObject();
                elementData.translations = translationsByElement[elementId] || [];
                return elementData;
            });
            
            // Create result object
            const result = subsection.toObject();
            result.elements = elementsWithTranslations;
            
            return result;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw AppError.database('Failed to retrieve complete subsection data', error);
        }
    }

    /**
     * Get subsection by slug with all content elements and their translations
     * @param slug The subsection slug
     * @param populateSectionItem Whether to populate section item
     * @returns Promise with the complete subsection data including elements and translations
     */
    async getCompleteSubSectionBySlug(
        slug: string,
        populateSectionItem = true
    ): Promise<any> {
        try {
            // Find subsection by slug
            const query = SubSectionModel.findOne({ slug });
            
            if (populateSectionItem) {
                query.populate({
                    path: 'sectionItem',
                    populate: {
                        path: 'section'
                    }
                }).populate('languages');
            }
            
            const subsection = await query.exec();
            
            if (!subsection) {
                throw AppError.notFound(`Subsection with slug ${slug} not found`);
            }
            
            // Use the ID to get complete data
            return this.getCompleteSubSectionById(subsection._id.toString(), false);
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw AppError.database('Failed to retrieve complete subsection data', error);
        }
    }
/**
 * Get subsections by section item ID with all content elements and their translations
 * @param sectionItemId The section item ID
 * @param activeOnly Whether to return only active subsections
 * @param limit Maximum number of subsections to return
 * @param skip Number of subsections to skip
 * @returns Promise with array of complete subsections data including elements and translations
 */
    async getSubSectionsBySectionItemId(
sectionItemId: string, activeOnly = true, limit = 100, skip = 0, includeContentCount: boolean    ): Promise<any[]> {
        try {
            if (!mongoose.Types.ObjectId.isValid(sectionItemId)) {
                throw AppError.validation('Invalid section item ID format');
            }

            // Build the query to get subsections
            const query: any = { 
                sectionItem: sectionItemId 
            };
            
            if (activeOnly) {
                query.isActive = true;
            }
            
            // Get subsections with basic population
            const subsections = await SubSectionModel.find(query)
                .sort({ order: 1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate({
                    path: 'sectionItem',
                    populate: {
                        path: 'section'
                    },
                    match: activeOnly ? { isActive: true } : {}
                })
                .populate('languages');
            
            if (subsections.length === 0) {
                return [];
            }

            // Get all subsection IDs
            const subsectionIds = subsections.map(sub => sub._id);

            // Get all content elements for these subsections
            const contentElements = await ContentElementModel.find({
                parent: { $in: subsectionIds },
                isActive: activeOnly
            }).sort({ order: 1 });

            // Get all element IDs
            const elementIds = contentElements.map(element => element._id);

            // Get all translations for these elements in a single query
            const translations = await ContentTranslationModel.find({
                contentElement: { $in: elementIds },
                isActive: activeOnly
            }).populate('language');

            // Group translations by content element ID
            const translationsByElement: Record<string, any[]> = {};
            
            translations.forEach(translation => {
                const elementId = translation.contentElement.toString();
                if (!translationsByElement[elementId]) {
                    translationsByElement[elementId] = [];
                }
                translationsByElement[elementId].push(translation);
            });

            // Group content elements by subsection ID
            const elementsBySubsection: Record<string, any[]> = {};
            
            contentElements.forEach(element => {
                const subsectionId = element.parent.toString();
                if (!elementsBySubsection[subsectionId]) {
                    elementsBySubsection[subsectionId] = [];
                }
                
                const elementData = element.toObject();
                const elementId = element._id.toString();
                elementData.translations = translationsByElement[elementId] || [];
                elementsBySubsection[subsectionId].push(elementData);
            });

            // Create complete result with subsections and their elements
            const result = subsections.map(subsection => {
                const subsectionData = subsection.toObject();
                const subsectionId = subsection._id.toString();
                subsectionData.elements = elementsBySubsection[subsectionId] || [];
                return subsectionData;
            });

            return result;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw AppError.database('Failed to retrieve complete subsections by section item ID', error);
        }
    }
}

export default new SubSectionService();