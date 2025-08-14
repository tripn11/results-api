const characters = {
    lowercase:["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"],
    uppercase: function () {
        return this.lowercase.map( (letter) => letter.toUpperCase() );
    },
    numbers:[1,2,3,4,5,6,7,8,9,0]
}

const codeData = [characters.lowercase, characters.uppercase(),characters.numbers];

const randomFromZeroToLimit = (limit) => {
    return Math.floor(Math.random() * (limit+1));
}

const codeGenerator = (length) => {
    let code = [];
    
    while(code.length < length){
        const randDataType = randomFromZeroToLimit(2);
        const randomDataType = codeData[randDataType];
        const randomCodeCharacter = randomFromZeroToLimit(randomDataType.length-1);
        const codeCharacter = randomDataType[randomCodeCharacter]; 
        code.push(codeCharacter);
    }

    return code.join('');
}

export default codeGenerator;