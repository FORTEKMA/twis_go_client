
export function parseIcon (element) {
    const typesList = element.types;
    let materialIcon;
  
    // Use a more extensive switch case for different place types
    switch (true) {
        case (typesList.includes('airport')):
            materialIcon = 'local-airport';
            break;
        case (typesList.includes('restaurant')):
            materialIcon = 'restaurant';
            break;
        case (typesList.includes('store')):
            materialIcon = 'local-mall';
            break;
        case (typesList.includes('bar')):
            materialIcon = 'local-bar';
            break;
        case (typesList.includes('hotel')):
            materialIcon = 'hotel';
            break;
        case (typesList.includes('bank')):
            materialIcon = 'account-balance';
            break;
        case (typesList.includes('hospital')):
            materialIcon = 'local-hospital';
            break;
        case (typesList.includes('library')):
            materialIcon = 'local-library';
            break;
        case (typesList.includes('museum')):
            materialIcon = 'museum';
            break;
        case (typesList.includes('park')):
            materialIcon = 'park';
            break;
        case (typesList.includes('shopping_mall')):
            materialIcon = 'local-mall';
            break;
        case (typesList.includes('tourist_attraction')):
            materialIcon = 'explore';
            break;
        case (typesList.includes('train_station')):
            materialIcon = 'train';
            break;
        case (typesList.includes('subway_station')):
            materialIcon = 'subway';
            break;
        case (typesList.includes('bus_station')):
            materialIcon = 'directions-bus';
            break;
        case (typesList.includes('gas_station')):
            materialIcon = 'local-gas-station';
            break;
        case (typesList.includes('church')):
            materialIcon = 'church';
            break;
        case (typesList.includes('synagogue')):
            materialIcon = 'house-of-worship';
            break;
        case (typesList.includes('restaurant')):
            materialIcon = 'local-dining';
            break;
        default:
            materialIcon = 'place';
    }
    
    return materialIcon;
  }