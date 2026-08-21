-- Allow job/scoring cleanup when applications already have AI scores.
-- RESTRICT blocked deleting archived jobs and editing scoring criteria after screening.

ALTER TABLE candidate_scores
  DROP CONSTRAINT IF EXISTS candidate_scores_scoring_model_id_fkey;

ALTER TABLE candidate_scores
  ADD CONSTRAINT candidate_scores_scoring_model_id_fkey
  FOREIGN KEY (scoring_model_id)
  REFERENCES scoring_models (id)
  ON DELETE CASCADE;

ALTER TABLE criterion_scores
  DROP CONSTRAINT IF EXISTS criterion_scores_criterion_id_fkey;

ALTER TABLE criterion_scores
  ADD CONSTRAINT criterion_scores_criterion_id_fkey
  FOREIGN KEY (criterion_id)
  REFERENCES scoring_criteria (id)
  ON DELETE CASCADE;
