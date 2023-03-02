type Species = {
    name: string;
    url: string;
}

interface Pokemon {
    species : Species
}

interface PokemonList {
    count: number;
    next: string;
    previous?: any;
    results: Array<Species>
}

function makeFlyweightUrls<ReturnType>(urls: Record<string, string>) {
    const target: Record<string, Promise<ReturnType>> = {};
    return new Proxy(target, {
        get: (target, property: string) => {
            console.log(`Fetching ${property} ${urls[property]}`);
            if (!target[property]){
                target[property] = fetch(urls[property]).then((response) => response.json())
            }
            return target[property];
        }
    })
}

(async () => {

    const pokemons = (
        await (await fetch("https://pokeapi.co/api/v2/pokemon")).json()
        ) as PokemonList;

    console.log(pokemons);

    const urls = pokemons.results.reduce((acc, { name, url}) => {
        return {...acc, [name]: url};
    },{});

    console.log(urls);

    const lookupObject = makeFlyweightUrls<Pokemon>(urls);

    const data = await lookupObject.bulbasaur;
    console.log(data.species);
    
    const data2 = await lookupObject.venusaur;
    console.log(data2.species);

})();

//npx ts-node flyweight.ts

