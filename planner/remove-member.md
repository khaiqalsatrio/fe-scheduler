# Planner: Remove Member and Leave Group

## Objective
Implement functionality for users to leave a group and for admins to remove members from a group.

## Features
1. **Leave Group**: Any member can opt to leave the group.
2. **Remove Member**: Group admins can remove other members from the group.

## Technical Details
- **Endpoint**: `DELETE /conversations/:id/members/:userId`
- **Method**: Already available in `ChatService.ts` as `removeMember(id, userId)`.
- **UI Logic**:
    - Add long-press or click action on member list items to show an action sheet (for admins).
    - Update the "Leave group" footer button to use the actual user ID.
    - Refresh the member list after removal.

## Workflow
1. Identify the current user's ID and role in the group.
2. Update `app/group-detail/[id].tsx` to handle member removal:
   - Add state to track context (admin/member).
   - Implement `handleRemoveMember` function.
3. Add confirmation dialogs for both "Leave" and "Remove" actions.
4. Auto-navigate back to chat list if the current user leaves.
