import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def main():
    print("ChileCupones Crawler Engine Starting...")
    
    from scrapers.mock_bank import MockBankScraper
    from scrapers.banco_chile import BancoChileScraper
    from scrapers.banco_itau import BancoItauScraper
    
    scrapers = [
        MockBankScraper(),
        BancoChileScraper(),
        BancoItauScraper()
    ]
    
    for scraper in scrapers:
        try:
            scraper.run()
        except Exception as e:
            print(f"Error running scraper {scraper.source_name}: {e}")
            
    print("All crawlers finished.")

if __name__ == "__main__":
    main()
