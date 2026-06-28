-- P1: Letter of Intent (LOI) document type.
-- Extends the document_type enum so LOIs can be drafted, filtered, and exported
-- like any other commercial document.
ALTER TYPE document_type ADD VALUE IF NOT EXISTS 'LOI' AFTER 'MOU';
