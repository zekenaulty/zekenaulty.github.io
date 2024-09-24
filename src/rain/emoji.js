export class Emoji {
    static instance;
    constructor() {
        if (Emoji.instance) {
            return Emoji.instance;
        }
        Emoji.instance = this;
        this.emojis = [
            '✧₊⁺',
            '♡',
            '❀',
            '⟢',
            '𖤓',
            '๋࣭ ⭑⚝'
            /*
            // Smileys & Emotion
            "😀", // Grinning Face
            "😁", // Beaming Face with Smiling Eyes
            "😂", // Face with Tears of Joy
            "🤣", // Rolling on the Floor Laughing
            "😃", // Grinning Face with Big Eyes
            "😄", // Grinning Face with Smiling Eyes
            "😅", // Grinning Face with Sweat
            "😆", // Grinning Squinting Face
            "😉", // Winking Face
            "😊", // Smiling Face with Smiling Eyes
            "😋", // Face Savoring Food
            "😎", // Smiling Face with Sunglasses
            "😍", // Smiling Face with Heart-Eyes
            "😘", // Face Blowing a Kiss
            "😗", // Kissing Face
            "😙", // Kissing Face with Smiling Eyes
            "😚", // Kissing Face with Closed Eyes
            "🙂", // Slightly Smiling Face
            "🤗", // Hugging Face
            "🤔", // Thinking Face
            "😐", // Neutral Face
            "😑", // Expressionless Face
            "😶", // Face Without Mouth
            "🙄", // Face with Rolling Eyes
            "😏", // Smirking Face
            "😣", // Persevering Face
            "😥", // Sad but Relieved Face
            "😮", // Face with Open Mouth
            "🤐", // Zipper-Mouth Face
            "😯", // Hushed Face
            "😪", // Sleepy Face
            "😫", // Tired Face
            "🥱", // Yawning Face
            "😴", // Sleeping Face
            "😛", // Face with Tongue
            "😜", // Winking Face with Tongue
            "🤪", // Zany Face
            "😝", // Squinting Face with Tongue
            "🤨", // Face with Raised Eyebrow
            "🧐", // Face with Monocle
            "🤓", // Nerd Face
            "😎", // Smiling Face with Sunglasses
            "🥸", // Disguised Face
            "🤩", // Star-Struck
            "🥳", // Partying Face
            "😏", // Smirking Face
            "😞", // Disappointed Face
            "😔", // Pensive Face
            "😟", // Worried Face
            "😕", // Confused Face
            "🙁", // Slightly Frowning Face
            "😣", // Persevering Face
            "😖", // Confounded Face
            "😫", // Tired Face
            "😩", // Weary Face
            "🥺", // Pleading Face
            "😢", // Crying Face
            "😭", // Loudly Crying Face
            "😤", // Face with Steam from Nose
            "😡", // Pouting Face
            "😠", // Angry Face
            "🤬", // Face with Symbols on Mouth
            "😈", // Smiling Face with Horns
            "👿", // Angry Face with Horns
            "💀", // Skull
            "☠️", // Skull and Crossbones
            "💩", // Pile of Poo
            "🤡", // Clown Face
            "👹", // Ogre
            "👺", // Goblin
            "👻", // Ghost
            "👽", // Alien
            "👾", // Alien Monster
            "🤖", // Robot
        
            // Animals & Nature
            "🐶", // Dog Face
            "🐱", // Cat Face
            "🐭", // Mouse Face
            "🐹", // Hamster Face
            "🐰", // Rabbit Face
            "🦊", // Fox Face
            "🐻", // Bear Face
            "🐼", // Panda Face
            "🐨", // Koala
            "🐯", // Tiger Face
            "🦁", // Lion Face
            "🐮", // Cow Face
            "🐷", // Pig Face
            "🐸", // Frog Face
            "🐵", // Monkey Face
            "🙈", // See-No-Evil Monkey
            "🙉", // Hear-No-Evil Monkey
            "🙊", // Speak-No-Evil Monkey
            "🐒", // Monkey
            "🦍", // Gorilla
            "🐔", // Chicken
            "🐧", // Penguin
            "🐦", // Bird
            "🐤", // Baby Chick
            "🦆", // Duck
            "🦅", // Eagle
            "🦉", // Owl
            "🦇", // Bat
            "🐺", // Wolf
            "🐗", // Boar
            "🐴", // Horse Face
            "🦄", // Unicorn Face
            "🐝", // Honeybee
            "🪲", // Beetle
            "🐞", // Lady Beetle
            "🦋", // Butterfly
            "🐢", // Turtle
            "🐍", // Snake
            "🦎", // Lizard
            "🦖", // T-Rex
            "🦕", // Sauropod
            "🐙", // Octopus
            "🦑", // Squid
            "🦞", // Lobster
            "🦀", // Crab
            "🐠", // Tropical Fish
            "🐡", // Blowfish
            "🐬", // Dolphin
            "🐳", // Spouting Whale
            "🐋", // Whale
            "🦈", // Shark
            "🐊", // Crocodile
        
            // Food & Drink
            "🍏", // Green Apple
            "🍎", // Red Apple
            "🍐", // Pear
            "🍊", // Tangerine
            "🍋", // Lemon
            "🍌", // Banana
            "🍉", // Watermelon
            "🍇", // Grapes
            "🍓", // Strawberry
            "🫐", // Blueberries
            "🍒", // Cherries
            "🍑", // Peach
            "🍍", // Pineapple
            "🥭", // Mango
            "🥥", // Coconut
            "🥝", // Kiwi Fruit
            "🍅", // Tomato
            "🥑", // Avocado
            "🍆", // Eggplant
            "🥔", // Potato
            "🥕", // Carrot
            "🌽", // Ear of Corn
            "🌶️", // Hot Pepper
            "🥒", // Cucumber
            "🥬", // Leafy Green
            "🥦", // Broccoli
            "🧄", // Garlic
            "🧅", // Onion
            "🍄", // Mushroom
            "🥜", // Peanuts
            "🌰", // Chestnut
            "🍞", // Bread
            "🥐", // Croissant
            "🥖", // Baguette Bread
            "🥨", // Pretzel
            "🥯", // Bagel
            "🥞", // Pancakes
            "🧇", // Waffle
            "🧀", // Cheese Wedge
            "🍖", // Meat on Bone
            "🍗", // Poultry Leg
            "🥩", // Cut of Meat
            "🥓", // Bacon
            "🍔", // Hamburger
            "🍟", // French Fries
            "🍕", // Pizza
            "🌭", // Hot Dog
            "🥪", // Sandwich
            "🌮", // Taco
            "🌯", // Burrito
            "🥙", // Stuffed Flatbread
            "🧆", // Falafel
            "🥚", // Egg
            "🍳", // Cooking
            "🥘", // Shallow Pan of Food
            "🍲", // Pot of Food
            "🥣", // Bowl with Spoon
            "🥗", // Green Salad
            "🍿", // Popcorn
            "🧈", // Butter
            "🧂", // Salt
            "🥫", // Canned Food
            "🍱", // Bento Box
            "🍘", // Rice Cracker
            "🍙", // Rice Ball
            "🍚", // Cooked Rice
            "🍛", // Curry Rice
            "🍜", // Steaming Bowl
            "🍝", // Spaghetti
            "🍠", // Roasted Sweet Potato
            "🍢", // Oden
            "🍣", // Sushi
            "🍤", // Fried Shrimp
            "🍥", // Fish Cake with Swirl
            "🥮", // Moon Cake
            "🍡", // Dango
            "🥟", // Dumpling
            "🥠", // Fortune Cookie
            "🥡", // Takeout Box
        
            // Activities
            "⚽", // Soccer Ball
            "🏀", // Basketball
            "🏈", // American Football
            "⚾", // Baseball
            "🎾", // Tennis
            "🏐", // Volleyball
            "🏉", // Rugby Football
            "🎱", // Pool 8 Ball
            "🏓", // Ping Pong
            "🏸", // Badminton
            "🏒", // Ice Hockey
            "🏑", // Field Hockey
            "🏏", // Cricket Game
            "⛳", // Flag in Hole (Golf)
            "🏹", // Bow and Arrow
            "🎣", // Fishing Pole
            "🥊", // Boxing Glove
            "🥋", // Martial Arts Uniform
            "⛸️", // Ice Skate
            "🎿", // Skis
            "🛷", // Sled
            "🥌", // Curling Stone
        
            // Transport & Places
            "🚗", // Car
            "🚕", // Taxi
            "🚙", // SUV
            "🚌", // Bus
            "🚎", // Trolleybus
            "🏎️", // Racing Car
            "🚓", // Police Car
            "🚑", // Ambulance
            "🚒", // Fire Engine
            "🚐", // Minibus
            "🚚", // Delivery Truck
            "🚛", // Articulated Lorry
            "🚜", // Tractor
            "🛴", // Kick Scooter
            "🚲", // Bicycle
            "🛵", // Motor Scooter
            "🏍️", // Motorcycle
            "🚨", // Police Car Light
            "🚔", // Oncoming Police Car
            "🚍", // Oncoming Bus
            "🚘", // Oncoming Automobile
            "🚖", // Oncoming Taxi
            "✈️", // Airplane
            "🛫", // Airplane Departure
            "🛬", // Airplane Arrival
            "🛩️", // Small Airplane
            "🚀", // Rocket
            "🛸", // Flying Saucer
            "🚁", // Helicopter
            "🛶", // Canoe
            "⛵", // Sailboat
            "🚤", // Speedboat
            "🛥️", // Motorboat
            "🛳️", // Passenger Ship
            "🚢", // Ship
            "⚓", // Anchor
            "🗽", // Statue of Liberty
            "🌋", // Volcano
            "🗻", // Mount Fuji
            "🏰", // Castle
            "🏯", // Japanese Castle
            "🏟️", // Stadium
            "🎡", // Ferris Wheel
            "🎢", // Roller Coaster
            "🎠", // Carousel Horse
        
            // Objects & Symbols
            "💡", // Light Bulb
            "🔦", // Flashlight
            "🕯️", // Candle
            "💰", // Money Bag
            "💳", // Credit Card
            "🛒", // Shopping Cart
            "🔑", // Key
            "🔨", // Hammer
            "📏", // Straight Ruler
            "📎", // Paperclip
            "📐", // Triangular Ruler
            "✂️", // Scissors
            "📝", // Memo
            "📊", // Bar Chart
            "🔗", // Link
            "🔒", // Locked
            "🔓", // Unlocked
            "🔔", // Bell
            "🔕", // Bell with Slash
            "🎈", // Balloon
            "🎉", // Party Popper
            "🎂", // Birthday Cake
            "🛌", // Person in Bed
            "🧸", // Teddy Bear
        
            // Flags
            "🇺🇸", // Flag: United States
            "🇨🇦", // Flag: Canada
            "🇲🇽", // Flag: Mexico
            "🇬🇧", // Flag: United Kingdom
            "🇫🇷", // Flag: France
            "🇩🇪", // Flag: Germany
            "🇯🇵", // Flag: Japan
            "🇮🇳", // Flag: India
            "🇨🇳", // Flag: China
            "🇧🇷", // Flag: Brazil
            "🇦🇺", // Flag: Australia
            */
        ];
        
    }
    getRandomEmoji() {
        const randomIndex = Math.floor(Math.random() * this.emojis.length);
        return this.emojis[randomIndex];
    }
    getRandomEmojis(length) {
        const emojis = [];
        for (let i = 0; i < length; i++) {
            emojis.push(this.getRandomEmoji());
        }
        return emojis;
    }
}