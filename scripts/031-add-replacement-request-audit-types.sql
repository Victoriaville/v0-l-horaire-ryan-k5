-- Add new audit action types for replacement request approval/rejection
ALTER TYPE audit_action_type ADD VALUE 'REPLACEMENT_REQUEST_APPROVED';
ALTER TYPE audit_action_type ADD VALUE 'REPLACEMENT_REQUEST_REJECTED';
