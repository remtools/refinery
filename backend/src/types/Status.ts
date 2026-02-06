export interface Status {
    key: string;
    label: string;
    entity_type: string; // 'Global', 'Epic', 'Story', 'AcceptanceCriterion', 'TestCase'
    color: string;
    is_deletable: boolean; // stored as 0/1 in SQLite, boolean in App
    is_archived: boolean;
    is_default: boolean;
    rank: number;
}
