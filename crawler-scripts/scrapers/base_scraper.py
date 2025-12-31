from abc import ABC, abstractmethod
from db import get_database
from datetime import datetime

import json
import os

class BaseScraper(ABC):
    def __init__(self, source_name):
        self.source_name = source_name
        self.db = get_database()
        self.collection = self.db['discounts']
        self.stores_collection = self.db['stores']
        self.payment_methods_collection = self.db['paymentmethods']

    @abstractmethod
    def fetch(self):
        """Fetch data from the source."""
        pass

    @abstractmethod
    def parse(self, raw_data):
        """Parse raw data into structured discount objects."""
        pass

    def save_to_json(self, discounts):
        """Fallback: Save to JSON file if DB is down."""
        file_path = os.path.join(os.path.dirname(__file__), '..', '..', 'backend', 'data', 'discounts.json')
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        existing_data = []
        if os.path.exists(file_path):
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    existing_data = json.load(f)
            except:
                pass
        
        # Simple upsert logic for JSON
        for new_d in discounts:
            # Add store info directly since we don't have relations in JSON mode
            new_d['store'] = {'name': new_d.pop('store_name', 'Unknown'), 'slug': new_d.pop('store_slug', 'unknown')}
            new_d['_id'] = new_d['externalId'] # Use externalId as ID
            
            found = False
            for i, old_d in enumerate(existing_data):
                if old_d.get('externalId') == new_d['externalId'] and old_d.get('source') == self.source_name:
                    existing_data[i] = {**old_d, **new_d}
                    found = True
                    break
            if not found:
                new_d['source'] = self.source_name
                existing_data.append(new_d)
                
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(existing_data, f, indent=2, default=str)
        print(f"[{self.source_name}] Saved {len(discounts)} items to JSON fallback.")

    def save(self, discounts):
        """Save discounts to the database, avoiding duplicates."""
        try:
            # Check connection
            self.db.command('ping')
        except Exception as e:
            print(f"[{self.source_name}] WARNING: Database not connected. Using JSON fallback.")
            self.save_to_json(discounts)
            return

        count = 0
        for discount in discounts:
            # Ensure store exists or create it
            store_slug = discount['store_slug']
            store = self.stores_collection.find_one({'slug': store_slug})
            if not store:
                store_id = self.stores_collection.insert_one({
                    'name': discount['store_name'],
                    'slug': store_slug,
                    'createdAt': datetime.now()
                }).inserted_id
            else:
                store_id = store['_id']

            # Prepare discount object
            discount_doc = {
                'title': discount['title'],
                'description': discount.get('description', ''),
                'discountPercentage': discount.get('discountPercentage'),
                'url': discount['url'],
                'imageUrl': discount.get('imageUrl'),
                'store': store_id,
                'source': self.source_name,
                'externalId': discount['externalId'],
                'active': True,
                'updatedAt': datetime.now()
            }

            # Upsert (Update if exists, Insert if not)
            result = self.collection.update_one(
                {'source': self.source_name, 'externalId': discount['externalId']},
                {'$set': discount_doc, '$setOnInsert': {'createdAt': datetime.now()}},
                upsert=True
            )
            if result.upserted_id:
                count += 1
        
        print(f"[{self.source_name}] Processed {len(discounts)} items. New inserts: {count}")

    def run(self):
        print(f"Starting scraper: {self.source_name}")
        raw_data = self.fetch()
        discounts = self.parse(raw_data)
        self.save(discounts)
        print(f"Finished scraper: {self.source_name}")
