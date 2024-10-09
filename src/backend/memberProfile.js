// backend/memberProfile.js

import wixData from 'wix-data';
import { roles } from 'wix-members-backend';

/**
 * Fetches members with a specific role
 * @param {string} roleId - The role ID to filter by
 * @returns {Promise<Array>} - Array of members with the specified role
 */
export async function getMembersByRole(roleId) {
    try {
        const membersResult = await wixData.query('Members/FullData').find();
        const members = membersResult.items;

        const membersWithRole = await Promise.all(members.map(async (member) => {
            const memberRoles = await roles.listMemberRoles(member._id);
            const hasRole = memberRoles.some(role => role._id === roleId);
            return hasRole ? member : null;
        }));

        return membersWithRole.filter(member => member !== null);
    } catch (error) {
        console.error('Error fetching members by role:', error);
        throw error;
    }
}
