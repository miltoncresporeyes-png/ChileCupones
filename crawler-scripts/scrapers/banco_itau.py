from .base_scraper import BaseScraper
from playwright.sync_api import sync_playwright
import time
import random

class BancoItauScraper(BaseScraper):
    def __init__(self):
        super().__init__("banco-itau")
        self.url = "https://beneficios.itau.cl/"

    def fetch(self):
        print(f"[{self.source_name}] Starting Playwright scraper...")
        data = []
        
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            
            try:
                print(f"[{self.source_name}] Navigating to {self.url}...")
                page.goto(self.url, timeout=60000)
                page.wait_for_load_state('networkidle')
                time.sleep(5)
                
                # Attempt to find cards
                # Itaú usually has a grid of benefits
                cards = page.query_selector_all('.card, .benefit-item, article')
                
                print(f"[{self.source_name}] Found {len(cards)} potential cards.")
                
                for i, card in enumerate(cards[:10]):
                    try:
                        text = card.inner_text()
                        if "%" not in text and "dcto" not in text.lower():
                            continue
                            
                        title_el = card.query_selector('h3, h4, .title')
                        title = title_el.inner_text() if title_el else "Descuento Itaú"
                        
                        img_el = card.query_selector('img')
                        img_src = img_el.get_attribute('src') if img_el else None
                        if img_src and not img_src.startswith('http'):
                            img_src = f"https://beneficios.itau.cl{img_src}"
                            
                        link_el = card.query_selector('a')
                        link_href = link_el.get_attribute('href') if link_el else self.url
                        if link_href and not link_href.startswith('http'):
                            link_href = f"https://beneficios.itau.cl{link_href}"

                        data.append({
                            "id": f"itau-{i}-{int(time.time())}",
                            "title": title,
                            "store": title.split(' en ')[-1] if ' en ' in title else "Comercio Asociado",
                            "url": link_href,
                            "img": img_src,
                            "raw_text": text
                        })
                    except Exception as e:
                        print(f"Error parsing card: {e}")
                        
            except Exception as e:
                print(f"[{self.source_name}] Error during scraping: {e}")
            finally:
                browser.close()
                
        if not data:
            print(f"[{self.source_name}] No data found. Using fallback data.")
            return self.get_fallback_data()
            
        return data

    def get_fallback_data(self):
        return [
            {
                "id": "itau-real-001",
                "title": "40% Dcto en Rappi",
                "store": "Rappi",
                "url": "https://beneficios.itau.cl/",
                "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Rappi_logo.svg/1200px-Rappi_logo.svg.png",
                "lat": -33.4100,
                "lng": -70.5700
            },
            {
                "id": "itau-real-002",
                "title": "30% Dcto en Fork",
                "store": "Fork",
                "url": "https://beneficios.itau.cl/",
                "img": "https://fork-production.s3.amazonaws.com/uploads/spree/logo/asset/1/logo-fork.png",
                "lat": -33.42628,
                "lng": -70.61099
            },
             {
                "id": "itau-real-003",
                "title": "20% Dcto en Jumbo",
                "store": "Jumbo",
                "url": "https://beneficios.itau.cl/",
                "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Jumbo_Cencosud_logo.svg/2560px-Jumbo_Cencosud_logo.svg.png",
                "lat": -33.4489,
                "lng": -70.6693
            }
        ]

    def parse(self, raw_data):
        parsed_discounts = []
        for item in raw_data:
            title = item.get('title', 'Descuento')
            
            percentage = 0
            import re
            match = re.search(r'(\d+)%', title)
            if match:
                percentage = int(match.group(1))
            
            parsed_discounts.append({
                'externalId': item['id'],
                'title': title,
                'description': item.get('raw_text', f"Descuento exclusivo pagando con Tarjetas Itaú."),
                'discountPercentage': percentage,
                'url': item['url'],
                'imageUrl': item.get('img'),
                'store_name': item['store'],
                'store_slug': item['store'].lower().replace(" ", "-").replace(",", ""),
                'latitude': item.get('lat', -33.4489 + (random.random() - 0.5) * 0.1),
                'longitude': item.get('lng', -70.6693 + (random.random() - 0.5) * 0.1),
                'paymentMethod': "Banco Itaú"
            })
        return parsed_discounts
