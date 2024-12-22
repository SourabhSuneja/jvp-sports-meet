ALTER DATABASE postgres SET timezone TO 'Asia/Kolkata';

-- Clean up previous tables
DROP TABLE IF EXISTS winners;
DROP TABLE IF EXISTS participants;

-- Create table "winners"
CREATE TABLE winners (
    row_id SERIAL PRIMARY KEY,
    game VARCHAR(255) NOT NULL,
    classcategory VARCHAR(255) NOT NULL,
    winner1 VARCHAR(255),
    winner2 VARCHAR(255),
    winner3 VARCHAR(255),
    winnerhouse1 VARCHAR(255) NOT NULL,
    winnerhouse2 VARCHAR(255) NOT NULL,
    winnerhouse3 VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_game_class_category UNIQUE (game, classcategory)
);

-- Enable Row Level Security (RLS)
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;

-- Policy for inserting data
CREATE POLICY "Allow authenticated users to insert data"
ON winners
FOR INSERT
TO authenticated
WITH CHECK ( true );

-- Policy for updating data
CREATE POLICY "Allow authenticated users to update data"
ON winners
FOR UPDATE
TO authenticated
USING ( true );

-- Policy for selecting data
CREATE POLICY "Allow users to select data"
ON winners
FOR SELECT
TO authenticated, anon
USING ( true );



-- Create table "participants"
CREATE TABLE participants (
    participation_id SERIAL PRIMARY KEY,
    game VARCHAR(255) NOT NULL,
    classcategory VARCHAR(255) NOT NULL,
    participant VARCHAR(255) NOT NULL,
    classsection VARCHAR(255) NOT NULL,
    house VARCHAR(255) NOT NULL,
    CONSTRAINT unique_participant_combination UNIQUE (game, classcategory, participant, classsection)
);


-- Enable Row Level Security (RLS)
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Policy for inserting data
CREATE POLICY "Allow authenticated users to insert data"
ON participants
FOR INSERT
TO authenticated
WITH CHECK ( true );

-- Policy for updating data
CREATE POLICY "Allow authenticated users to update data"
ON participants
FOR UPDATE
TO authenticated
USING ( true );

-- Policy for deleting data
CREATE POLICY "Allow authenticated users to delete data"
ON participants
FOR DELETE
TO authenticated
USING ( true );

-- Policy for selecting data
CREATE POLICY "Allow users to select data"
ON participants
FOR SELECT
TO authenticated, anon
USING ( true );


