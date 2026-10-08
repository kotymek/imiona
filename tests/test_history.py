import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from scripts import update_data as updater

class HistoryTests(unittest.TestCase):
    def test_archive_keeps_dates_and_updates_same_date(self):
        with tempfile.TemporaryDirectory(dir=Path(__file__).parent) as directory, patch.object(updater, 'HISTORY', Path(directory)):
            for date, count in [('2026-01-20', 10), ('2026-07-01', 11), ('2026-07-01', 12)]:
                updater.archive({'date': date, 'names': [{'name':'ANNA','gender':'K','count':count}]})
            self.assertEqual(json.loads((Path(directory)/'index.json').read_text()), [{'date':'2026-01-20'},{'date':'2026-07-01'}])
            self.assertEqual(json.loads((Path(directory)/'2026-01-20.json').read_text())['names'][0]['count'],10)
            self.assertEqual(json.loads((Path(directory)/'2026-07-01.json').read_text())['names'][0]['count'],12)
    def test_validation_rejects_incomplete_and_duplicate_sources(self):
        female={'name':'ANNA','gender':'K','count':10}
        male={'name':'JAN','gender':'M','count':5}
        updater.validate_names([female,male])
        for names in [[], [female], [female,male,male], [female,{**male,'count':0}]]:
            with self.assertRaises(ValueError): updater.validate_names(names)

if __name__ == '__main__': unittest.main()
