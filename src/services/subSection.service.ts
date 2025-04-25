import ContentElementModel from '../models/ContentElement.model';
import { AppError } from '../middleware/errorHandler.middlerware';
import SubSectionModel from '../models/subSection.model';
import { ICreateSubSection, IUpdateSubSection } from '../types/sub.section.types';
import mongoose from 'mongoose';
import SectionModel from '../models/sections.model';
import ContentTranslationModel from '../models/ContentTranslation.model';

class SubSectionService {
    /**
     * Create a new subsection
     * @param subsectionData The subsection data to create
     * @returns Promise with the created subsection
     */
    async createSubSection(subsectionData: ICreateSubSection): Promise<ICreateSubSection> {
        try {
            // Check if subsection with this slug already exists
            const existingSubSection = await SubSectionModel.findOne({ slug: subsectionData.slug });
            if (existingSubSection) {
                throw AppError.badRequest(`Subsection with slug '${subsectionData.slug}' already exists`);
            }

            // Create new subsection
            const subsection = new SubSectionModel({
                name: subsectionData.name,
                description: subsectionData.description,
                slug: subsectionData.slug,
                order: subsectionData.order || 0,
                isActive: subsectionData.isActive !== undefined ? subsectionData.isActive : true,
                parentSections: subsectionData.parentSections || [],
                languages: subsectionData.languages || [],
                metadata: subsectionData.metadata
            });
            
            await subsection.save();
            
            // Update parent sections if provided
            if (subsectionData.parentSections && subsectionData.parentSections.length > 0) {
                await SectionModel.updateMany(
                { _id: { $in: subsectionData.parentSections } },
                { $addToSet: { subSections: subsection._id } }
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
                    path: 'parentSections',
                    match: activeOnly ? { isActive: true } : {},
                    options: { sort: { order: 1 } }
                })
                .populate('languages');
            
            // If requested, get content element count for each subsection
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
     * @param populateParents Whether to populate parent sections
     * @param includeContentElements Whether to include content elements
     * @returns Promise with the subsection if found
     */
    async getSubSectionById(
        id: string, 
        populateParents = true,
        includeContentElements = false
    ): Promise<ICreateSubSection> {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw AppError.validation('Invalid subsection ID format');
            }

            const query = SubSectionModel.findById(id);
            
            if (populateParents) {
                query.populate('parentSections').populate('languages');
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
     * Get subsection by slug
     * @param slug The subsection slug
     * @param populateParents Whether to populate parent sections
     * @param includeContentElements Whether to include content elements
     * @returns Promise with the subsection if found
     */
    async getSubSectionBySlug(
        slug: string,
        populateParents = true,
        includeContentElements = false
    ): Promise<ICreateSubSection> {
        try {
            const query = SubSectionModel.findOne({ slug });
            
            if (populateParents) {
                query.populate('parentSections').populate('languages');
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

        
            
            // Handle parent section updates if provided
            if (updateData.parentSections) {
                // Get current parents to find differences
                const currentParents = subsection.parentSections.map(parent => 
                    parent instanceof mongoose.Types.ObjectId ? parent.toString() : parent
                );
                
                const newParents = updateData.parentSections.map(parent => 
                    parent instanceof mongoose.Types.ObjectId ? parent.toString() : parent
                );
                
                // Find parents to add and remove
                const toAdd = newParents.filter(parent => !currentParents.includes(parent));
                const toRemove = currentParents.filter(parent => !newParents.includes(parent));
                
                // Update sections that are being added (add this subsection)
                if (toAdd.length > 0) {
                    await SectionModel.updateMany(
                        { _id: { $in: toAdd } },
                        { $addToSet: { subSections: subsection._id } }
                    );
                }
                
                // Update sections that are being removed (remove this subsection)
                if (toRemove.length > 0) {
                    await SectionModel.updateMany(
                        { _id: { $in: toRemove } },
                        { $pull: { subSections: subsection._id } }
                    );
                }
            }
            
            // Update the subsection
            const updatedSubSection = await SubSectionModel.findByIdAndUpdate(
                id,
                { $set: updateData },
                { new: true, runValidators: true }
            ).populate('parentSections').populate('languages');
            
         
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
                
                // Remove this subsection from all parent sections
                await SectionModel.updateMany(
                    { subSections: id },
                    { $pull: { subSections: id } }
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
     * @param populateParents Whether to populate parent sections
     * @returns Promise with the complete subsection data including elements and translations
     */
async getCompleteSubSectionById(
    id: string, 
    populateParents = true
): Promise<any> {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw AppError.validation('Invalid subsection ID format');
        }

        // First get the subsection
        const query = SubSectionModel.findById(id);
        
        if (populateParents) {
            query.populate('parentSections').populate('languages');
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
        result.contentElements = elementsWithTranslations;
        
        return result;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw AppError.database('Failed to retrieve complete subsection data', error);
    }
}

/**
 * Get subsection by slug with all content elements and their translations
 * @param slug The subsection slug
 * @param populateParents Whether to populate parent sections
 * @returns Promise with the complete subsection data including elements and translations
 */
async getCompleteSubSectionBySlug(
    slug: string,
    populateParents = true
): Promise<any> {
    try {
        // Find subsection by slug
        const query = SubSectionModel.findOne({ slug });
        
        if (populateParents) {
            query.populate('parentSections').populate('languages');
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

}

export default new SubSectionService();