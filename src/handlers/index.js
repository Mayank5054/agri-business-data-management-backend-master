const { default: axios } = require("axios")
const stateModel = require('../models/states')
const districtModel = require('../models/districts')
const talukaModel = require('../models/talukas')
const villageModel = require('../models/villages')

const API_KEY = '579b464db66ec23bdd000001cd84580bc63949e879cf7124162f03fe'

const init = async () => {
    const apis = [
        // 'ASSAM',
        // 'ANDAMAN_and_NICOBAR_ISLANDS',
        // 'ANDHRA_PRADESH',
        // 'ARUNACHAL_PRADESH',
        // 'BIHAR',
        // 'CHANDIGARH',
        // 'CHHATTISGARH',
        // 'DADRA_and_NAGAR_HAVELI',
        // 'DAMAN_and_DIU',
        // 'GOA',
        // 'GUJARAT',
        // 'HARYANA',
        // 'HIMACHAL_PRADESH',
        // 'JAMMU_and_KASHMIR',
        // 'JHARKHAND',
        // 'KARNATAKA',
        // 'KERALA',
        // 'LAKSHADWEEP',
        // 'MADHYA_PRADESH',
        // 'MAHARASHTRA',
        // 'MANIPUR',
        // 'MEGHALAYA',
        // 'MIZORAM',
        // 'NAGALAND',
        // 'NCT_OF_DELHI',
        // 'ODISHA',
        // 'PUDUCHERRY',
        // 'PUNJAB',
        // 'RAJASTHAN',
        // 'SIKKIM',
        // 'TAMIL_NADU',
        // 'TRIPURA',
        // 'UTTAR_PRADESH',
        // 'UTTARAKHAND',
        // 'WEST_BENGAL'
    ]

    console.log('Data Insertion Started')
    for (let i = 0; i < apis.length; i++) {
        await dataManager(apis[i])
        console.log('Data Inserted Successfully ' + i)
    }
    console.log('All Data Inserted Successfully')
}

const dataManager = async (api) => {

    let stateMap = {}
    let districtMap = {}
    let talukaMap = {}
    let villageMap = {}

    let villages = []

    let resp = require(`./data/${api}.json`)
    let records = resp['Village Directory']
    console.log(records.length)
    for (const record of records) {

        let stateId = 0

        if(!record['STATE NAME']) {
            record['STATE NAME'] = api
        }

        if (stateMap[record['STATE NAME']]) {
            stateId = stateMap[record['STATE NAME']]
        } else {
            let res = await stateModel.create({
                name: record['STATE NAME']
            })

            stateId = res.id
            stateMap[record['STATE NAME']] = res.id
        }

        if(!record['DISTRICT NAME']) {
            record['DISTRICT NAME'] = record['STATE NAME']
        }

        let districtId = 0
        if (districtMap[record['DISTRICT NAME']]) {
            districtId = districtMap[record['DISTRICT NAME']]
        } else {
            let res = await districtModel.create({
                name: record['DISTRICT NAME'],
                stateId: stateId
            })

            districtId = res.id
            districtMap[record['DISTRICT NAME']] = res.id
        }

        let talukaId = 0
        if(!record['SUB-DISTRICT NAME']) {
            record['SUB-DISTRICT NAME'] = record['DISTRICT NAME']
        }
        if (talukaMap[record['SUB-DISTRICT NAME']]) {
            talukaId = talukaMap[record['SUB-DISTRICT NAME']]
        } else {
            let res = await talukaModel.create({
                name: record['SUB-DISTRICT NAME'],
                districtId: districtId,
                stateId: stateId
            })

            talukaId = res.id
            talukaMap[record['SUB-DISTRICT NAME']] = res.id
        }

        if(!record['Area Name']) {
            continue;
        }
        let villageId = 0
        if (!villageMap[record['Area Name']]) {
            villages.push({
                name: record['Area Name'],
                talukaId: talukaId,
                districtId: districtId,
                stateId: stateId
            })
            villageMap[record['Area Name']] = 1
        }
    }

    if (villages.length > 0) {
        await villageModel.bulkCreate(villages)
    }
    return true
}

module.exports = init