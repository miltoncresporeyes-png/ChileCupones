from .base_scraper import BaseScraper
import random

class MockBankScraper(BaseScraper):
    def __init__(self):
        super().__init__("mock-bank-chile")

    def fetch(self):
        # Simulate fetching HTML or API response
        print("Fetching data from Mock Bank...")
        
        # Randomize discount slightly to show updates
        base_discount = random.randint(15, 25)
        
        return [
            {
                "id": "101",
                "title": f"{base_discount}% Dcto en Starbucks",
                "store": "Starbucks",
                "url": "https://www.starbucks.cl",
                "img": "https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Starbucks_Corporation_Logo_2011.svg/1200px-Starbucks_Corporation_Logo_2011.svg.png",
                "lat": -33.42628, # Providencia
                "lng": -70.61099
            },
            {
                "id": "102",
                "title": "40% Dcto en McDonald's",
                "store": "McDonald's",
                "url": "https://www.mcdonalds.cl",
                "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/McDonald%27s_Golden_Arches.svg/1200px-McDonald%27s_Golden_Arches.svg.png",
                "lat": -33.4372, # Santiago Centro
                "lng": -70.6506
            },
            {
                "id": "103",
                "title": "30% en Farmacias Ahumada",
                "store": "Farmacias Ahumada",
                "url": "https://www.farmaciasahumada.cl",
                "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Farmacias_Ahumada_logo.svg/2560px-Farmacias_Ahumada_logo.svg.png",
                "lat": -33.4100, # Las Condes
                "lng": -70.5700
            },
            {
                "id": f"104-{random.randint(1000, 9999)}", # New random offer
                "title": "25% en Dunkin Donuts",
                "store": "Dunkin Donuts",
                "url": "https://www.dunkindonuts.cl",
                "img": "https://upload.wikimedia.org/wikipedia/en/thumb/b/b8/Dunkin%27_Donuts_logo.svg/1200px-Dunkin%27_Donuts_logo.svg.png",
                "lat": -33.4200, 
                "lng": -70.6000
            }
        ]

    def parse(self, raw_data):
        parsed_discounts = []
        for item in raw_data:
            # Infer bank/payment method for demo purposes
            bank_name = "Banco de Chile" if "101" in item['id'] else "Banco Santander" if "103" in item['id'] else "CMR Falabella"
            
            parsed_discounts.append({
                'externalId': item['id'],
                'title': item['title'],
                'description': f"Descuento exclusivo pagando con {bank_name}.",
                'discountPercentage': int(item['title'].split('%')[0]),
                'url': item['url'],
                'imageUrl': item['img'],
                'store_name': item['store'],
                'store_slug': item['store'].lower().replace("'", "").replace(" ", "-"),
                'latitude': item.get('lat'),
                'longitude': item.get('lng'),
                'paymentMethod': bank_name # Field for filtering
            })
        return parsed_discounts
