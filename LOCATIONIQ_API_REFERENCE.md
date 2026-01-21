# 🌐 LocationIQ API Reference - MapDrawer Integration

## Quick Start

**Endpoint**: `https://us1.locationiq.com/v1/reverse`
**Authentication**: API key in query parameter
**Format**: JSON
**Rate Limit**: 5000 requests/day (Free Tier)

---

## API Usage in MapDrawer

### Endpoint URL Pattern

```javascript
`https://us1.locationiq.com/v1/reverse?key=YOUR_TOKEN&lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&statecode=1&normalizeaddress=1`
```

### Your Token (Replace in 3 locations)

```
pk.119a9226741b7c75df13771d20dd9c53
```

---

## Response Fields Extracted

### Address Components

| Field | Example | Fallback Chain |
|-------|---------|----------------|
| `city` | Vellore | city → town → village → hamlet → suburb → county |
| `road` | Gandhi Nagar 17th East Main Road | Direct |
| `postcode` | 632006 | Direct or null |
| `state` | Tamil Nadu | Direct |
| `state_code` | TN | Only with statecode=1 |
| `country` | India | Direct |
| `country_code` | in | From address object, uppercase |
| `county` | Katpadi | Direct |
| `district` | Varies | county → district → state_district |
| `attraction` | Auxilium Arts & Science College | Direct (landmark) |
| `neighbourhood` | BSNL Quarters | Direct |
| `region` | Tamil Nadu | Direct |
| `type` | school | Direct |
| `boundingbox` | [lat_min, lat_max, lon_min, lon_max] | Array of 4 strings |

### Example Response

```json
{
  "place_id": "60310287",
  "licence": "https://locationiq.com/attribution",
  "osm_type": "node",
  "osm_id": "5568763423",
  "lat": "51.5233879",
  "lon": "-0.1582367",
  "display_name": "221B Baker Street, Baker Street, Marylebone, London...",
  "address": {
    "attraction": "221B Baker Street",
    "road": "Baker Street",
    "suburb": "Marylebone",
    "city": "London",
    "state_district": "Greater London",
    "state": "England",
    "postcode": "NW1 6XE",
    "country": "United Kingdom",
    "country_code": "gb",
    "state_code": "ENG",
    "type": "historic"
  },
  "boundingbox": [
    "51.5233379",
    "51.5234379",
    "-0.1582867",
    "-0.1581867"
  ]
}
```

---

## Query Parameters

### Required
```
key=YOUR_API_KEY
lat=LATITUDE
lon=LONGITUDE
```

### Optional (Recommended for MapDrawer)
```
format=json                    // JSON response format
addressdetails=1              // Include address breakdown
statecode=1                   // Include state codes (USA, Canada, Australia)
normalizeaddress=1            // Normalize address structure
accept-language=en            // English field names
```

### Optional (For Future Use)
```
namedetails=1                 // Include name variations
exclude=address_only          // Exclude non-address results
include=amenities,landmarks   // Include specific types
zoom=18                       // Zoom level (1-18)
```

---

## Three Integration Points in MapDrawer

### 1. **fetchLocationDetails() - Drawing & Selection**

**Location**: Line ~120-180
**Called From**: 
- `onDraw()` - When user draws polygon
- `handleSelectLand()` - When user selects saved land

**Implementation**:
```javascript
const response = await axios.get(
  `https://us1.locationiq.com/v1/reverse?key=pk.119a9226741b7c75df13771d20dd9c53&lat=${centroid.lat}&lon=${centroid.lng}&format=json&addressdetails=1&statecode=1&normalizeaddress=1`,
  { headers: { 'Accept-Language': 'en' } }
);
```

**Extracts**:
```javascript
{
  area: addr.city || addr.town || ... || "Data not available",
  landmark: addr.attraction || addr.building || ...,
  road: addr.road,
  neighbourhood: addr.neighbourhood || addr.suburb,
  postcode: addr.postcode,
  district: addr.county || addr.district || addr.state_district,
  state: addr.state,
  state_code: addr.state_code,
  country: addr.country,
  country_code: addr.country_code.toUpperCase(),
  region: addr.region,
  place_type: addr.type,
  coordinates: { lat, lng },
  bbox: { south, north, west, east }
}
```

**Caching**:
```javascript
if (locationDetails[landId]) return; // Use cache
```

---

### 2. **handleLocationFound() - GPS Callback**

**Location**: Line ~190-240
**Triggered By**: Browser geolocation API when GPS is enabled

**Implementation**:
```javascript
const response = await axios.get(
  `https://us1.locationiq.com/v1/reverse?key=pk.119a9226741b7c75df13771d20dd9c53&lat=${e.latlng.lat}&lon=${e.latlng.lng}&format=json&addressdetails=1&statecode=1&normalizeaddress=1`,
  { headers: { 'Accept-Language': 'en' } }
);
```

**Updates**:
- User location marker
- User address display
- Location details for search key
- Resets land dropdown to "Select a land"

---

### 3. **searchPlace() - Search Handler**

**Location**: Line ~270-350
**Triggered By**: User clicks search suggestion or presses Enter

**Workflow**:
```
1. Get lat/lon from Nominatim suggestion
2. Call LocationIQ reverse geocoding
3. Extract all address components
4. Update location details cache
5. Show on map
```

**Implementation**:
```javascript
const reverseResponse = await axios.get(
  `https://us1.locationiq.com/v1/reverse?key=pk.119a9226741b7c75df13771d20dd9c53&lat=${lat}&lon=${lon}&format=json&addressdetails=1&statecode=1&normalizeaddress=1`,
  { headers: { 'Accept-Language': 'en' } }
);
```

---

## Data Validation & Error Handling

### Safe Field Access

```javascript
// Before using any field, check if exists
{address.city || address.town || ... || "Data not available"}

// For country code, ensure uppercase
country_code: (addr.country_code || "").toUpperCase()

// For state code, handle missing values
state_code: addr.state_code || "Data not available"
```

### Error Handling

```javascript
try {
  const response = await axios.get(...);
  // Process response
} catch (error) {
  console.error("Error fetching location details:", error);
  // Gracefully degraded - old data remains
  // User notification via toast (if critical)
}
```

---

## Bounding Box Usage

### Current Implementation

```javascript
bbox: bbox.length === 4 ? {
  south: parseFloat(bbox[0]),
  north: parseFloat(bbox[1]),
  west: parseFloat(bbox[2]),
  east: parseFloat(bbox[3])
} : null
```

### Applied in fitBounds()

```javascript
mapRef.current.fitBounds(bounds, { padding: [50, 50] });
```

### Future Potential

```javascript
// Zoom to bbox bounds instead of polygon bounds
const mapBounds = L.latLngBounds([
  [bbox.south, bbox.west],
  [bbox.north, bbox.east]
]);
mapRef.current.fitBounds(mapBounds);
```

---

## State Code Reference

### Available Regions

**USA**: All 50 states (CA, NY, TX, FL, etc.)
**Canada**: All provinces (ON, BC, QC, etc.)
**Australia**: All territories (NSW, VIC, QLD, etc.)

### Example

```
Response for Mumbai:
state: "Maharashtra"
state_code: "MH"

Response for California:
state: "California"
state_code: "CA"

Response for Tamil Nadu:
state: "Tamil Nadu"
state_code: "TN"
```

---

## Address Hierarchy

LocationIQ returns address components in hierarchical structure:

```
SPECIFIC → GENERAL

Place Type (e.g., "school")
  ↓
Landmark/Building (e.g., "Auxilium Arts & Science College")
  ↓
Road (e.g., "Gandhi Nagar 17th East Main Road")
  ↓
Neighbourhood (e.g., "BSNL Quarters")
  ↓
Town/City (e.g., "Vellore")
  ↓
District/County (e.g., "Katpadi")
  ↓
State (e.g., "Tamil Nadu")
  ↓
Country (e.g., "India")
```

---

## Optimization Tips

### 1. Cache Efficiently

```javascript
// Check cache BEFORE making API call
if (locationDetails[landId]) {
  return; // Don't fetch
}
```

### 2. Batch Operations

```javascript
// Save land once with coordinates
// LocationIQ called only once per save
sendCoordinates() → fetchLocationDetails() once
```

### 3. Avoid Redundant Calls

```javascript
// Same land = cached result
// Different lands = new API call
// Same search location = cached in 'search' key
```

### 4. Monitor Rate Limits

```javascript
// You have 5000/day
// With caching: ~100-500 calls/day typical
// Plenty of headroom
```

---

## Common Issues & Solutions

### Issue 1: Missing State Code
**Cause**: State code only available for USA, Canada, Australia
**Solution**: Show "Data not available" gracefully
**Code**: 
```javascript
state_code: addr.state_code || "Data not available"
```

### Issue 2: Landmark Not Found
**Cause**: Rural areas may not have landmarks
**Solution**: Field becomes "Data not available", card hides it
**Code**:
```javascript
{landmark !== "Data not available" && (
  <div>Landmark: {landmark}</div>
)}
```

### Issue 3: API Timeout
**Cause**: Network delay or API overload
**Solution**: Graceful error handling + console log
**Code**:
```javascript
try { ... } catch (error) {
  console.error("Error:", error);
}
```

### Issue 4: Country Code Case
**Cause**: LocationIQ returns lowercase (e.g., "in")
**Solution**: Convert to uppercase for consistency
**Code**:
```javascript
country_code: (addr.country_code || "").toUpperCase()
```

---

## Response Time

### Typical Latency
- **Cache Hit**: ~0ms (instant)
- **API Call**: 200-500ms
- **Total Operation**: 200-500ms

### Optimized Workflow
1. User draws polygon (no API call yet)
2. Centroid calculated instantly
3. API call starts (200-500ms)
4. Data displays when ready
5. User sees results while confirming

---

## Attribution

**As per LocationIQ Terms**:
```javascript
licence: "https://locationiq.com/attribution"
```

Display attribution when applicable:
```
© OpenStreetMap contributors
Powered by LocationIQ
```

---

## Testing the API

### Manual Test via Browser

```
https://us1.locationiq.com/v1/reverse?key=pk.119a9226741b7c75df13771d20dd9c53&lat=12.9576369&lon=79.1452371&format=json&addressdetails=1&statecode=1&normalizeaddress=1
```

### Test in Console

```javascript
axios.get(`https://us1.locationiq.com/v1/reverse?key=pk.119a9226741b7c75df13771d20dd9c53&lat=51.5233879&lon=-0.1582367&format=json&addressdetails=1&statecode=1&normalizeaddress=1`, { headers: { 'Accept-Language': 'en' } })
  .then(response => console.log(response.data))
  .catch(error => console.error(error));
```

---

## Supported Regions

- ✅ **India**: Full coverage (used in example)
- ✅ **USA**: Full coverage with state codes
- ✅ **Europe**: Full coverage
- ✅ **Global**: 180+ countries
- ✅ **Remote Areas**: May have limited landmarks

---

## Rate Limit Tracking

```javascript
// You have 5000 requests/day
// Estimate:
- Draw polygon: 1 call
- Select land: 0 calls (cached)
- Search: 1 call
- GPS: 1 call

// Typical day: 4-10 calls per user
// 5000 calls supports ~500-1000 active users
```

---

## Future API Enhancements

### Ready to Implement
1. **Timezone API** - Get timezone for any coordinate
2. **Nearby POI** - Find schools, hospitals near land
3. **Static Maps** - Generate shareable location preview
4. **Reverse Batch** - Process multiple coordinates at once

### Example
```javascript
// Add timezone to location details
timezone: response.data.timezone || "Data not available"
```

---

## Documentation Links

- **LocationIQ Docs**: https://docs.locationiq.com/docs/reverse-geocoding
- **API Reference**: https://docs.locationiq.com/reference/reverse-api
- **Your Dashboard**: https://my.locationiq.com/

---

## Summary

| Aspect | Value |
|--------|-------|
| **API Provider** | LocationIQ |
| **Endpoints Used** | 1 (reverse geocoding) |
| **Integration Points** | 3 (draw, GPS, search) |
| **Data Fields** | 15+ |
| **Rate Limit** | 5000/day |
| **Caching** | Yes (efficient) |
| **Error Handling** | Graceful |
| **Mobile Support** | Yes |
| **Status** | ✅ Production Ready |

---

**Updated**: January 19, 2026
**Version**: 2.0
**Status**: ✅ Complete
