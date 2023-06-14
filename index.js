// Form link: https://form.jotform.com/231637722343050
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.listen(5001, () => {console.log("Server started on port 5001")})


const BASE_URL = 'https://energy311dev.appspot.com/a/building';
const states = ['AK', 'AL', 'AR', 'AZ', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 
                'IN', 'KS', 'KY', 'LA', 'MA', 'MD', 'ME', 'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 
                'NE', 'NH', 'NJ', 'NM', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 
                'TX', 'UT', 'VA', 'VT', 'WA', 'WI', 'WV', 'WY'];
const timezones = {
    'America/Chicago': ['AL', 'AR', 'IA', 'IL', 'IN', 'KS', 'KY', 'LA', 'MN', 'MO', 'MS', 'ND', 'NE', 'OK', 'SD', 'TN', 'TX', 'WI'],
    'America/Denver': ['CO', 'MT', 'NM', 'UT', 'WY'],
    'America/New_York': ['CT', 'DE', 'FL', 'GA', 'MA', 'MD', 'ME', 'MI', 'NC', 'NH', 'NJ', 'NY', 'OH', 'PA', 'RI', 'SC', 'VA', 'VT', 'WV'],
    'America/Los_Angeles': ['CA', 'NV', 'OR', 'WA'],
    'America/Anchorage': ['AK'],
    'Pacific/Honolulu': ['HI']
    };

function stateAbbreviation(name) {
    // Attempts to find state code from state name

    const states = {
        'Alabama': 'AL',
        'Alaska': 'AK',
        'Arizona': 'AZ',
        'Arkansas': 'AR',
        'California': 'CA',
        'Colorado': 'CO',
        'Connecticut': 'CT',
        'Delaware': 'DE',
        'Florida': 'FL',
        'Georgia': 'GA',
        'Hawaii': 'HI',
        'Idaho': 'ID',
        'Illinois': 'IL',
        'Indiana': 'IN',
        'Iowa': 'IA',
        'Kansas': 'KS',
        'Kentucky': 'KY',
        'Louisiana': 'LA',
        'Maine': 'ME',
        'Maryland': 'MD',
        'Massachusetts': 'MA',
        'Michigan': 'MI',
        'Minnesota': 'MN',
        'Mississippi': 'MS',
        'Missouri': 'MO',
        'Montana': 'MT',
        'Nebraska': 'NE',
        'Nevada': 'NV',
        'New Hampshire': 'NH',
        'New Jersey': 'NJ',
        'New Mexico': 'NM',
        'New York': 'NY',
        'North Carolina': 'NC',
        'North Dakota': 'ND',
        'Ohio': 'OH',
        'Oklahoma': 'OK',
        'Oregon': 'OR',
        'Pennsylvania': 'PA',
        'Rhode Island': 'RI',
        'South Carolina': 'SC',
        'South Dakota': 'SD',
        'Tennessee': 'TN',
        'Texas': 'TX',
        'Utah': 'UT',
        'Vermont': 'VT',
        'Virginia': 'VA',
        'Washington': 'WA',
        'West Virginia': 'WV',
        'Wisconsin': 'WI',
        'Wyoming': 'WY'
    };

    return states[name] || '';

}

app.post("/api/post_building", async (req, res) => {
    // Makes POST request to Energy311 API with validity checks

    const data = req.body;

    // Checks for valid state name/code
    const stateCode = states.includes(data.businessaddress.state) ? data.businessaddress.state : (
        stateAbbreviation(data.businessaddress.state) != '' ? stateAbbreviation(data.businessaddress.state) : '');
    
    const body = {
        "name": data.businessname,
        "building_name": "",
        "address": data.businessaddress.addr_line1,
        "city": data.businessaddress.city,
        "stateCode": stateCode,
        "zip": !isNaN(data.businessaddress.postal) ? data.businessaddress.postal : '',
        "phone": /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im.test(data.phonenumber.full) ? 
                    data.phonenumber.full : '',
        "active": true,
        "collections": true,
        "countryCode": "US",
        "fee": 0.0,
        "minCharge": 0.0,
        "payment_method": "ach",
        "template": "bill_jcpl.html",
        "timeZone": (Object.keys(timezones).find(key => timezones[key].includes(stateCode)) || ''),
    }


    axios.post(BASE_URL, body).then( (resp) => {
        
        console.log('Building created');
        res.json(body);

    }).catch(error => {
            console.error(error);
        });

})
   

