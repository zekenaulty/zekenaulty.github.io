import * as $1999 from './1999-2000.json';
import * as $2000 from './2000.json';
import * as $2001 from './2001-2002.json';
import * as $2004 from './2004-2005.json';
import * as $2007 from './2007-2011.json';
import * as $2013 from './2013-2016.json';
import * as $2017 from './2017-2021.json';
import * as $2022 from './2022.json';
import * as $skills from './skills.json';
import * as $about from './aboutMe.json';

export const Resume = {
    about: $about.default,
    skills: $skills.default,
    experience : [
        $1999.default,
        $2000.default,
        $2001.default,
        $2004.default,
        $2007.default,
        $2013.default,
        $2017.default,
        $2022.default,
    ]
};
