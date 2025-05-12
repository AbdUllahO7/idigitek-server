import mongoose, { Schema } from 'mongoose';
import UserModel from '../models/user.model';
import UserSectionModel from '../models/UserSectionModel';
import SectionModel from '../models/sections.model';

export class UserSectionService {
  /**
   * Get all active sections for a user
   * @param userId User ID
   */
  async getUserActiveSections(userId: string) {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      const userSections = await UserSectionModel.find({
        userId,
        status: true
      }).populate({
        path: 'sectionId',
        match: { isActive: true } // Only include sections that are active globally
      });
      
      // Filter out null values (sections that are globally inactive)
      const activeSections = userSections
        .map(userSection => userSection.sectionId)
        .filter(section => section !== null);
      
      return activeSections;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Activate a section for a user
   * @param userId User ID
   * @param sectionId Section ID
   */
  async activateSectionForUser(userId: string, sectionId: string) {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      const section = await SectionModel.findById(sectionId);
      if (!section) {
        throw new Error('Section not found');
      }
      
      // Check if section is globally active
      if (!section.isActive) {
        throw new Error('Cannot activate a globally inactive section');
      }
      
      // Check if the relationship already exists
      let userSection = await UserSectionModel.findOne({
        userId,
        sectionId
      });
      
      if (userSection) {
        // Update status if needed
        if (!userSection.status) {
          userSection.status = true;
          await userSection.save();
        }
      } else {
        // Create new relationship
        userSection = new UserSectionModel({
          userId,
          sectionId,
          status: true
        });
        await userSection.save();
      }
      
      return userSection;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Deactivate a section for a user
   * @param userId User ID
   * @param sectionId Section ID
   */
  async deactivateSectionForUser(userId: string, sectionId: string) {
    try {
      // Find the relationship
      const userSection = await UserSectionModel.findOne({
        userId,
        sectionId
      });
      
      if (!userSection) {
        throw new Error('User does not have this section activated');
      }
      
      // Update status to inactive
      userSection.status = false;
      await userSection.save();
      
      return userSection;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Get all users who have a specific section active
   * @param sectionId Section ID
   */
  async getUsersWithActiveSection(sectionId: string) {
    try {
      const section = await SectionModel.findById(sectionId);
      if (!section) {
        throw new Error('Section not found');
      }
      
      const userSections = await UserSectionModel.find({
        sectionId,
        status: true
      }).populate('userId');
      
      return userSections.map(userSection => userSection.userId);
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Toggle section status for a user
   * @param userId User ID
   * @param sectionId Section ID
   */
  async toggleSectionForUser(userId: string, sectionId: string) {
    try {
      const userSection = await UserSectionModel.findOne({
        userId,
        sectionId
      });
      
      if (userSection) {
        // Toggle the status
        userSection.status = !userSection.status;
        await userSection.save();
        return {
          sectionId,
          status: userSection.status,
          message: userSection.status ? 'Section activated' : 'Section deactivated'
        };
      } else {
        // Create new active relationship
        const newUserSection = new UserSectionModel({
          userId,
          sectionId,
          status: true
        });
        
        await newUserSection.save();
        return {
          sectionId,
          status: true,
          message: 'Section activated'
        };
      }
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Handle when a section is globally deactivated
   * This method ensures consistency when a section is deactivated globally
   * @param sectionId Section ID
   */
  async handleSectionGlobalDeactivation(sectionId: string) {
    try {
      // When a section is globally deactivated, automatically deactivate it for all users
      // This ensures consistency between global section status and user preferences
      await UserSectionModel.updateMany(
        { sectionId, status: true },
        { status: false }
      );
      
      return { message: 'Section deactivated for all users' };
    } catch (error) {
      throw error;
    }
  }
}