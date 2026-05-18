-- Add REPLACEMENT_APPLICATION_ADDED audit action type for manually added candidates
ALTER TYPE audit_action_type ADD VALUE IF NOT EXISTS 'REPLACEMENT_APPLICATION_ADDED';
