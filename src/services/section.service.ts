import SectionBasicInfoModel from '../models/sectionBasicInfo.model';
import SubSectionModel from '../models/subSection.model';
import { ISectionBasicInfo } from '../types/sectionBasicInfo.types';

class SectionService {
    /**
     * Create a new section
     */
    async createSection(sectionData: Partial<ISectionBasicInfo>) {
        try {
        const section = new SectionBasicInfoModel({
            section_name: sectionData.section_name,
            description: sectionData.description,
            order: sectionData.order || 0,
            isActive: sectionData.isActive !== undefined ? sectionData.isActive : true,
            subSections: sectionData.subSections || [],
        });
        
        await section.save();
        
        // Update subsections if provided
        if (sectionData.subSections && sectionData.subSections.length > 0) {
            await SubSectionModel.updateMany(
            { _id: { $in: sectionData.subSections } },
            { $addToSet: { parentSections: section._id } }
            );
        }
        
        return section;
        } catch (error) {
        console.error('Error in createSection service:', error);
        throw error;
        }
    }
    
    /**
     * Get all sections
     */
    async getAllSections(activeOnly = true, limit = 100, skip = 0) {
        try {
        const query = activeOnly ? { isActive: true } : {};
        
        const sections = await SectionBasicInfoModel.find(query)
            .sort({ order: 1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate({
            path: 'subSections',
            match: activeOnly ? { isActive: true } : {},
            options: { sort: { order: 1 } }
            });
        
        return sections;
        } catch (error) {
        console.error('Error in getAllSections service:', error);
        throw error;
        }
    }
    
    /**
     * Get section by ID
     */
    async getSectionById(id: string, populateSubSections = true) {
        try {
        const query = SectionBasicInfoModel.findById(id);
        
        if (populateSubSections) {
            query.populate({
            path: 'subSections',
            options: { sort: { order: 1 } }
            });
        }
        
        const section = await query.exec();
        
        if (!section) {
            throw new Error(`Section with ID ${id} not found`);
        }
        
        return section;
        } catch (error) {
        console.error('Error in getSectionById service:', error);
        throw error;
        }
    }
    
    /**
     * Update section by ID
     */
    async updateSectionById(id: string, updateData: Partial<ISectionBasicInfo>) {
        try {
        const section = await SectionBasicInfoModel.findById(id);
        
        if (!section) {
            throw new Error(`Section with ID ${id} not found`);
        }
        
        // Handle subsection updates if provided
        if (updateData.subSections) {
            // Get current subsections to find differences
            const currentSubSections = section.subSections.map(sub => sub.toString());
            const newSubSections = updateData.subSections.map(sub => sub.toString());
            
            // Find subsections to add and remove
            const toAdd = newSubSections.filter(sub => !currentSubSections.includes(sub));
            const toRemove = currentSubSections.filter(sub => !newSubSections.includes(sub));
            
            // Update subsections that are being added (add this section as parent)
            if (toAdd.length > 0) {
            await SubSectionModel.updateMany(
                { _id: { $in: toAdd } },
                { $addToSet: { parentSections: section._id } }
            );
            }
            
            // Update subsections that are being removed (remove this section as parent)
            if (toRemove.length > 0) {
            await SubSectionModel.updateMany(
                { _id: { $in: toRemove } },
                { $pull: { parentSections: section._id } }
            );
            }
        }
        
        // Update the section
        const updatedSection = await SectionBasicInfoModel.findByIdAndUpdate(
            id,
            { ...updateData },
            { new: true, runValidators: true }
        ).populate('subSections');
        
        return updatedSection;
        } catch (error) {
        console.error('Error in updateSectionById service:', error);
        throw error;
        }
    }
    
    /**
     * Delete section by ID
     */
    async deleteSectionById(id: string, hardDelete = false) {
        try {
        const section = await SectionBasicInfoModel.findById(id);
        
        if (!section) {
            throw new Error(`Section with ID ${id} not found`);
        }
        
        if (hardDelete) {
            // Permanently delete
            await SectionBasicInfoModel.findByIdAndDelete(id);
            
            // Remove this section as parent from all subsections
            await SubSectionModel.updateMany(
            { parentSections: id },
            { $pull: { parentSections: id } }
            );
        } else {
            // Soft delete
            await SectionBasicInfoModel.findByIdAndUpdate(id, { isActive: false });
        }
        
        return { success: true, message: `Section ${hardDelete ? 'deleted' : 'deactivated'} successfully` };
        } catch (error) {
        console.error('Error in deleteSectionById service:', error);
        throw error;
        }
    }
}

export default new SectionService();