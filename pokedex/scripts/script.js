const pokedex = {};

// To store all pokemon names in requested generation
pokedex.displayNamesList = new Map();

// Colours for display associated with appropriate pokemon type
pokedex.typeColors = {
    grass: 'green',
    fire: 'red',
    water: 'blue'
}

// Each pokemon type and their matchup strengths and weaknesses
pokedex.matchups = {
    bug: {
        strong: ['grass', 'poison', 'psychic'],
        weak: ['fire', 'flying', 'poison', 'rock']
    },
    dragon: {
        strong: [],
        weak: ['ice']
    },
    ice: {
        strong: ['dragon', 'flying', 'grass', 'ground'],
        weak: ['fighting', 'fire', 'rock']
    },
    fighting: {
        strong: ['ice', 'normal', 'rock'],
        weak: ['flying', 'psychic']
    },
    fire: {
        strong: ['bug', 'grass', 'ice'],
        weak: ['ground', 'rock', 'water']
    },
    flying: {
        strong: ['bug', 'fighting', 'grass', 'ground'],
        weak: ['electric', 'ice', 'rock']
    },
    grass: {
        strong: ['ground', 'rock', 'water'],
        weak: ['bug', 'fire', 'flying', 'ice', 'poison']
    },
    ghost: {
        strong: ['fighting', 'normal'],
        weak: ['psychic']
    },
    ground: {
        strong: ['electric', 'fire', 'poison', 'rock'],
        weak: ['grass', 'ice', 'water']
    },
    electric: {
        strong: ['flying', 'water'],
        weak: ['ground']
    },
    normal: {
        strong: [],
        weak: ['fighting']
    },
    poison: {
        strong: ['bug', 'grass'],
        weak: ['ground', 'psychic', 'bug']
    },
    psychic: {
        strong: ['fighting', 'poison'],
        weak: ['bug']
    },
    rock: {
        strong: ['bug', 'fire', 'flying', 'electric', 'ice'],
        weak: ['fighting', 'grass', 'ground', 'water']
    },
    water: {
        strong: ['fire', 'ground', 'rock'],
        weak: ['electric', 'grass']
    }
}

// Color schemes for each pokemon type
pokedex.colorSchemes = {
    bug: {
        light: '#DBFFC1',
        main: '#7A9E35',
        dark: '#344F00',
    },
    dragon: {
        light: '#D3C8F4',
        main: '#403075',
        dark: '#13073A',
    },
    ice: {
        light: '#C6E8FF',
        main: '#468DBB',
        dark: '#0E5D91',
    },
    fighting: {
        light: '#DDB39F',
        main: '#4C2717',
        dark: '#1B0800',
    },
    fire: {
        light: '#FFAFAF',
        main: '#FF0F0F',
        dark: '#A90000',
    },
    flying: {
        light: '#E2F5FE',
        main: '#7CC9EA',
        dark: '#3596C0',
    },
    grass: {
        light: '#A0E8A0',
        main: '#099209',
        dark: '#005500',
    },
    ghost: {
        light: '#E3C5EA',
        main: '#733F7E',
        dark: '#43104E',
    },
    ground: {
        light: '#E2C4B5',
        main: '#954E35',
        dark: '#4B1604',
    },
    electric: {
        light: '#FFE4A3',
        main: '#EBA900',
        dark: '#926900',
    },
    normal: {
        light: '#F2E0D2',
        main: '#A38670',
        dark: '#65452B',
    },
    poison: {
        light: '#FFCCFA',
        main: '#A6409D',
        dark: '#7A1271',
    },
    // fairy: {
    //     light: '#FFCCFA',
    //     main: '#A6409D',
    //     dark: '#7A1271',
    // },
    psychic: {
        light: '#FFB7E0',
        main: '#920A57',
        dark: '#550030',
    },
    rock: {
        light: '#DDD6D0',
        main: '#544E4A',
        dark: '#281D15',
    },
    water: {
        light: '#AFD4ED',
        main: '#065B93',
        dark: '#02385A',
    }
}

// HTML elements that will change color with the type of the selected pokemon
pokedex.elementsToChange = {
    light: [
        '.searchBox',
        '.pokemonListItem',
        'body'
    ],
    borders: [
        '.pokemonNumber',
        '.pokemonName',
        '.pokemonImageWrapper',
        '.pokemonDescription',
        '.pokemonEvolution',
        '.pokemonMatchups'
    ]
}

// Pull all names of pokemon in user specified generation
pokedex.pullNamesList = function() {
    return $.ajax({
        url: 'https://pokeapi.co/api/v2/pokedex/2/',
        method: 'GET',
        dataType: 'json'
    });
}

// Store the names pulled in .pullNamesList() and put them on the page
pokedex.displayNames = async function() {
    const pokemon = await pokedex.pullNamesList();
    let pokemonNumber = 1;
    $('.pokemonList').empty();
	pokemon.pokemon_entries.forEach(function(item) {
        $('.pokemonList').append(pokedex.listItemString(pokemonNumber, item.pokemon_species.name));
        // save the pokemon name & number in a Map for search
        pokedex.displayNamesList.set(pokemonNumber, item.pokemon_species.name);
        pokemonNumber++;
    });
}

// Pull stats on selected pokemon
pokedex.pullPokemonInfo = function(pokeNumber) {
    return $.ajax({
        url: `https://pokeapi.co/api/v2/pokemon/${pokeNumber}/`,
        method: 'GET',
        dataType: 'json'
    });
}

// Pull flavour text, not stored in the same API endpoint for some absurd reason
pokedex.pullFlavorText = function (pokeNumber) {
    return $.ajax({
        url: `https://pokeapi.co/api/v2/pokemon-species/${pokeNumber}/`,
        method: 'GET',
        dataType: 'json'
    });
}

// Display selected pokemon information & stats
pokedex.displayPokemonInfo = async function(pokeNumber) {
    $('.pokemonDisplay').empty();
    pokedex.loadingAnimation();
    const selectedPokemon = await pokedex.pullPokemonInfo(pokeNumber);
    const flavorTextReturn = await pokedex.pullFlavorText(pokeNumber);
    // Dig through flavorTextReturn for text from RED in ENGLISH
    let correctFlavorText = '';
    flavorTextReturn.flavor_text_entries.forEach(function(element) {
        if (element.version.name === "red" && element.language.name === "en") {
            correctFlavorText = element.flavor_text;
        }
    });
    // Object holding all stats to display
    pokedex.currentPokemonInfo = {
        name: selectedPokemon.name,
        type: selectedPokemon.types[selectedPokemon.types.length - 1].type.name,
        number: pokedex.threeDigits(pokeNumber),
        height: `${selectedPokemon.height / 10} m`,
        weight: `${selectedPokemon.weight / 10} kg`,
        text: correctFlavorText,
        image: selectedPokemon.sprites.front_default,
    }
    // Massive string containing the HTML to display pokemon information
    const currentPokemon = pokedex.currentPokemonInfo;
    const color = pokedex.colorSchemes[currentPokemon.type];
    const displayString = `
    <p class="pokemonNumber">#${currentPokemon.number}</p>
    <h2 class="pokemonName">${currentPokemon.name}</h2>
    <div class="imageAndButtonsWrapper">
        <div class="pokemonImageWrapper">
            <img class="pokemonImage" src="${currentPokemon.image}" alt="${currentPokemon.name}">
        </div>
        <ul class="displayButtons">
        <li class="displayButtonItem" style="
                background-color: ${color.main};
                border-top: 3px solid ${color.light};
                border-left: 3px solid ${color.light};
                border-right: 3px solid ${color.dark};
                border-bottom: 3px solid ${color.dark};
            ">Info</li>
        <li class="displayButtonItem" style="
                background-color: ${color.main};
                border-top: 3px solid ${color.light};
                border-left: 3px solid ${color.light};
                border-right: 3px solid ${color.dark};
                border-bottom: 3px solid ${color.dark};
            ">Type</li>
    </ul>
    </div>
    <div class="pokemonDescription clearfix">
        <p class="flavorText">${currentPokemon.text}</p>
        <div class="pokemonHeight">
            <h4>Height:</h4>
            <p>${currentPokemon.height}</p>
        </div>
        <div class="pokemonWeight">
            <h4>Weight:</h4>
            <p>${currentPokemon.weight}</p>
        </div>
    </div>
    <div class="pokemonMatchups hideSection clearfix">
        <h3 class="typeTitle">Pokemon Type:</h3>
        <p class="pokemonType" style="
                background-color: ${color.main};
                border-top: 3px solid ${color.light};
                border-left: 3px solid ${color.light};
                border-right: 3px solid ${color.dark};
                border-bottom: 3px solid ${color.dark};
            ">
                ${currentPokemon.type}
            </p>
        <div class="strongMatchups">
            <h4 class="typeSubtitle">Strong Matchups:</h4>
            <ul class="strongMatchupList">
                <!-- matchups populate here -->
            </ul>
        </div>
        <div class="weakMatchups">
            <h4 class="typeSubtitle">Weak Matchups:</h4>
            <ul class="weakMatchupList">
                <!-- matchups populate here -->
            </ul>
        </div>
    </div>
    
    <div class="displayVignette"></div>
    `
    $('.pokemonDisplay').empty();
    $('.pokemonDisplay').append(displayString);
    pokedex.typeMatchups(pokedex.currentPokemonInfo.type);
    pokedex.changeColors(pokedex.currentPokemonInfo.type);
    // Variable for use in toggling between sections "info" and "type"
    pokedex.currentSection = 'Info';
}

// Play animation while user waits for API to return information
   // Pass boolean to show or hide animations as appropriate
pokedex.loadingAnimation = function() {
    const pokeballSpinHtml = `<div class="pokeballSpinner">
        <img class="pokeballTop" src="assets/pokeballTop.png" alt="">
        <img class="pokeballMiddle" src="assets/pokeballMiddle.png" alt="">
        <img class="pokeballBottom" src="assets/pokeballBottom.png" alt="">
    </div>`
    $('.pokemonDisplay').append(pokeballSpinHtml);
}

// Access & Display type matchups for selected pokemon
pokedex.typeMatchups = function(type) {
    pokedex.matchups[type].strong.forEach(function(item) {
        const color = pokedex.colorSchemes[item];
        const matchupListItem = `<li class="matchupListItem" style="
                background-color: ${color.main};
                border-top: 3px solid ${color.light};
                border-left: 3px solid ${color.light};
                border-right: 3px solid ${color.dark};
                border-bottom: 3px solid ${color.dark};
            ">
            ${item}
        </li>`;
        $('.strongMatchupList').append(matchupListItem);
    });
    // If there isn't anything in the matchup column, put a placeholder.
    if ($('.strongMatchupList').text().trim() === '') {
        const color = pokedex.colorSchemes.normal;
        const noMatchup = `<li class="matchupListItem" style="
                background-color: ${color.main};
                border-top: 3px solid ${color.light};
                border-left: 3px solid ${color.light};
                border-right: 3px solid ${color.dark};
                border-bottom: 3px solid ${color.dark};
            ">
            None
        </li>`
        $('.strongMatchupList').append(noMatchup);
    }
    pokedex.matchups[type].weak.forEach(function(item) {
        const color = pokedex.colorSchemes[item];
        const matchupListItem = `<li class="matchupListItem" style="
                background-color: ${color.main};
                border-top: 3px solid ${color.light};
                border-left: 3px solid ${color.light};
                border-right: 3px solid ${color.dark};
                border-bottom: 3px solid ${color.dark};
            ">
            ${item}
        </li>`;
        $('.weakMatchupList').append(matchupListItem);
    });
}

// Get user input - search string
pokedex.getSearch = function() {
    const searchInput = $('#searchBox').val().toLowerCase();
    pokedex.displaySearch(searchInput);
}

// Check whether mainString contains subString, return true/false accordingly
pokedex.contains = function(mainString, subString) {
    if (mainString.indexOf(subString) !== -1) {
        return true;
    } else {
        return false;
    }
}

// Display search results - anything containing search input
pokedex.displaySearch = function(userSearch) {
    $('.pokemonList').empty();
    for (let [key, value] of pokedex.displayNamesList.entries()) {
        // If value (pokemon name) contains userSearch, put it in the list
        if (pokedex.contains(value, userSearch)) {
            $('.pokemonList').append(pokedex.listItemString(key, value));
        }
    }
    pokedex.changeColors(pokedex.currentPokemonInfo.type);
    $('.pokemonListItem:last-child').css('box-shadow', '0 2px 10px rgba(0,0,0,0.7)');
}

// Append zeros to make display number always three digits (eg '001')
pokedex.threeDigits = function(pokeNumber) {
    let numberString = '';
    if (pokeNumber < 10) {
        numberString = `00${pokeNumber}`;
    } else if (pokeNumber < 100) {
        numberString = `0${pokeNumber}`;
    } else {
        numberString = `${pokeNumber}`;
    }
    return numberString;
}

// Create string for a list item to be appended to $('.pokemonList')
pokedex.listItemString = function(number, name) {
    const numberString = pokedex.threeDigits(number)    
    return `<li class="pokemonListItem" data-pokeNumber="${number}"><span>${numberString}.</span>${name}</li>`;
}

// Change the color scheme of the page based on the selected type of pokemon
pokedex.changeColors = function(type) {
    pokedex.elementsToChange.light.forEach(function (element) {
        $(element).css('background-color', pokedex.colorSchemes[type].light);
    });
    pokedex.elementsToChange.borders.forEach(function(element) {
        $(element).css('border-color', pokedex.colorSchemes[type].main);
    });
    const displayGradient = `linear-gradient(135deg,
                                    transparent,
                                    ${pokedex.colorSchemes[type].dark},
                                    transparent,
                                    ${pokedex.colorSchemes[type].dark}),
                             radial-gradient(${pokedex.colorSchemes[type].light}, 
                                    black 75%)`;
    $('.displayVignette').css('background-image', displayGradient);
    $('.pokemonListWrapper::-webkit-scrollbar-thumb').css('background-color', pokedex.colorSchemes[type].main);
}

// Swap between pokedex info and type information in pokemon display
pokedex.infoTypeSwap = function(swapTo) {
    if (swapTo !== pokedex.currentSection) {
        $('.pokemonDescription').toggleClass('hideSection');
        $('.pokemonMatchups').toggleClass('hideSection');
        pokedex.currentSection = swapTo;
    }
}

// Listen for user actions
pokedex.eventListener = function() {
    // User action: select pokemon from master list
    $('.pokemonList').on('click', '.pokemonListItem', function() {
        pokedex.displayPokemonInfo($(this).attr('data-pokeNumber'));
    });

    // User action: type in searchbox
    $('.searchBox').on('keyup', function() {
        pokedex.getSearch();
    });

    // User action: (attempt to) submit search form
    $('.searchForm').on('submit', function(event){
        event.preventDefault();
    });

    // User action: click either 'info' or 'type' in pokemon display
    $('.pokemonDisplay').on('click', '.displayButtonItem', function() {
        pokedex.infoTypeSwap($(this).text());
    });
}

pokedex.defaultSettings = async function() {
    await pokedex.displayPokemonInfo(1);
    $('.pokemonMatchups').addClass('hideSection');
}

pokedex.init = function() {
    pokedex.displayNames();
    pokedex.eventListener();
    pokedex.defaultSettings();
}

$(pokedex.init());