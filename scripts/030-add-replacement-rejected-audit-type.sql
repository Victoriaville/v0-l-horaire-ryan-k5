-- Add REPLACEMENT_REJECTED to audit_action_type enum if it doesn't exist
ALTER TYPE audit_action_type ADD VALUE 'REPLACEMENT_REJECTED' BEFORE 'SHIFT_CREATED';
