
const city = require('./city.model')


const getCities = () => {
    return city.find({}) 
}
const getOneCity = (id) => {
    return city.findById(id) 
}


const findCity = (name) => {
    if (name) return city.findOne({ name: name })
    throw new Error ('Get user function from controller was called without specifying id or email')
}

const findOneCity = (id) => {
    return city.findById(id)
}

// const findCity = (newCity) => {
//     return new Promise((resolve,reject) => {
//         city.find({city: newCity.name})
//         .then( cities => {
//             resolve( cities.length > 0)
//         })
//         .catch(error => {
//             reject(error)
//         })
//     })
// }
const createCity = (newCity) => {
    return new city({
        ...newCity,
    }).save()      
}
const editCity = (id, newCity) => {
    return city.findOneAndUpdate({_id: id}, {
        ...newCity,
        name: newCity.name,
        zip_code: newCity.zip_code
    },{
        new: true //This option is in order to return the new document modified
    })
}

const deleteCity = (id) => {
    return city.findByIdAndRemove(id)
}


module.exports = {
    getCities,
    getOneCity,
    findCity,
    findOneCity,
    createCity,
    editCity,
    deleteCity
}

