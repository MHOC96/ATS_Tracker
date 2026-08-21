-- Allow recording "Hired" through admin_decisions (matches application status HIRED).

ALTER TYPE admin_decision_type ADD VALUE IF NOT EXISTS 'HIRED';
