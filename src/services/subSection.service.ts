import SubSectionModel from '../models/subSection.model';
import SectionBasicInfoModel from '../models/sectionBasicInfo.model';
import { ISubSection } from '../types/sub.section.types';

class SubSectionService {
    /**
     * Create a new subsection
     */
    async createSubSection(subsectionData: Partial<ISubSection>) {
        try {
        const subsection = new SubSectionModel({
            name: subsectionData.name,
            description: subsectionData.description,
            order: subsectionData.order || 0,
            isActive: subsectionData.isActive !== undefined ? subsectionData.isActive : true,
            parentSections: subsectionData.parentSections || [],
            languages: subsectionData.languages || [],
        });
        
        await subsection.save();
        
        // Update parent sections if provided
        if (subsectionData.parentSections && subsectionData.parentSections.length > 0) {
            await SectionBasicInfoModel.updateMany(
            { _id: { $in: subsectionData.parentSections } },
            { $addToSet: { subSections: subsection._id } }
            );
        }
        
        return subsection;
        } catch (error) {
        console.error('Error in createSubSection service:', error);
        throw error;
        }
    }
    
    /**
     * Get all subsections
     */
    async getAllSubSections(activeOnly = true, limit = 100, skip = 0) {
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
        
        return subsections;
        } catch (error) {
        console.error('Error in getAllSubSections service:', error);
        throw error;
        }
    }
    
    /**
     * Get subsection by ID
     */
    async getSubSectionById(id: string, populateParents = true) {
        try {
        const query = SubSectionModel.findById(id);
        
        if (populateParents) {
            query.populate('parentSections').populate('languages');
        }
        
        const subsection = await query.exec();
        
        if (!subsection) {
            throw new Error(`SubSection with ID ${id} not found`);
        }
        
        return subsection;
        } catch (error) {
        console.error('Error in getSubSectionById service:', error);
        throw error;
        }
    }
    
    /**
     * Update subsection by ID
     */
    async updateSubSectionById(id: string, updateData: Partial<ISubSection>) {
        try {
        const subsection = await SubSectionModel.findById(id);
        
        if (!subsection) {
            throw new Error(`SubSection with ID ${id} not found`);
        }
        
        // Handle parent section updates if provided
        if (updateData.parentSections) {
            // Get current parents to find differences
            const currentParents = subsection.parentSections.map(parent => parent.toString());
            const newParents = updateData.parentSections.map(parent => parent.toString());
            
            // Find parents to add and remove
            const toAdd = newParents.filter(parent => !currentParents.includes(parent));
            const toRemove = currentParents.filter(parent => !newParents.includes(parent));
            
            // Update sections that are being added (add this subsection)
            if (toAdd.length > 0) {
            await SectionBasicInfoModel.updateMany(
                { _id: { $in: toAdd } },
                { $addToSet: { subSections: subsection._id } }
            );
            }
            
            // Update sections that are being removed (remove this subsection)
            if (toRemove.length > 0) {
            await SectionBasicInfoModel.updateMany(
                { _id: { $in: toRemove } },
                { $pull: { subSections: subsection._id } }
            );
            }
        }
        
        // Update the subsection
        const updatedSubSection = await SubSectionModel.findByIdAndUpdate(
            id,
            { ...updateData },
            { new: true, runValidators: true }
        ).populate('parentSections').populate('languages');
        
        return updatedSubSection;
        } catch (error) {
        console.error('Error in updateSubSectionById service:', error);
        throw error;
        }
    }
    
    /**
     * Delete subsection by ID
     */
    async deleteSubSectionById(id: string, hardDelete = false) {
        try {
        const subsection = await SubSectionModel.findById(id);
        
        if (!subsection) {
            throw new Error(`SubSection with ID ${id} not found`);
        }
        
        if (hardDelete) {
            // Permanently delete
            await SubSectionModel.findByIdAndDelete(id);
            
            // Remove this subsection from all parent sections
            await SectionBasicInfoModel.updateMany(
            { subSections: id },
            { $pull: { subSections: id } }
            );
        } else {
            // Soft delete
            await SubSectionModel.findByIdAndUpdate(id, { isActive: false });
        }
        
        return { success: true, message: `SubSection ${hardDelete ? 'deleted' : 'deactivated'} successfully` };
        } catch (error) {
        console.error('Error in deleteSubSectionById service:', error);
        throw error;
        }
    }
}

export default new SubSectionService();