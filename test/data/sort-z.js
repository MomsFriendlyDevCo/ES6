import {setTimeout} from 'timers/promises';

export function init() { // Async eventual function return
	return setTimeout(100)
		.then(()=> 'z-init');
}

export default 'z';
