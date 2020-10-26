require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const helmet = require('helmet')
const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common'
app.use(morgan(morganSetting))
app.use(helmet())
app.use(cors())
const PORT = process.env.PORT || 8000
const POKEDEX = require('./pokedex.json')

app.use(function validateBearerToken(req, res, next) {
    const token = req.get('Authorization')
    const apiToken = process.env.API_TOKEN
    if(!token || token.split(' ')[0] !== apiToken) {
        return res.status(401).json({error: 'Unauthorized request'})
    }
    next()
})

const validTypes = [`Bug`, `Dark`, `Dragon`, `Electric`, `Fairy`, `Fighting`, `Fire`, `Flying`, `Ghost`, `Grass`, `Ground`, `Ice`, `Normal`, `Poison`, `Psychic`, `Rock`, `Steel`, `Water`]

function handleGetTypes(req, res) {
    const type = req.query.type
    res.json(validTypes)
}

app.get('/types', handleGetTypes)

function handleGetPokemon(req, res) {
    let response = POKEDEX.pokemon
    const { name, type } = req.query
    if (!name && !type){
        res.status(400).send('You must enter a name or type')
    }
    if (name) {
        response = response.filter(pokemon => pokemon.name.toLowerCase().includes(name.toLowerCase()))
    }
    if (req.query.type) {
        response = response.filter(pokemon => pokemon.type.includes(req.query.type))
    }
    res.json(response)
}

app.get('/pokemon', handleGetPokemon)

app.use((error, req, res, next) => {
    let response
    if(process.env.NODE_ENV === 'production') {
        response = { error: {message: 'Server Error'}}
    } else {
        response = {error}
    }
    res.status(500).json(response)
})

app.listen(PORT, () => {})