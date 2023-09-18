import {setTimeout} from 'timers/promises';

export function init() { // Async eventual function return
	return setTimeout(10)
		.then(()=> 'z-init');
}

export default 'z';
