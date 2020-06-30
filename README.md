# Reason Codes Tree Panel

| Libre panel for Create, Read, Update and Delete of Downtime Reasons

Custom Tree Structured (Parent-Child Relationship) Plugin that enables users to Create, Read, Update and Delete Reason Codes that are stored in PostgresDB.

------

### PostgresDB Query example: 

SELECT * FROM reason_codes

-------

### Data format
Data MUST be formatted as a TABLE !

-------

### Relationship
Root --> Category --> Reason --> Sub-Reason --> unlimited Sub-Reasons ....
