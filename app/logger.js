'use strict';

module.exports.info=function(content){
	if (content) content = content.toUpperCase();
	console.log('--'+ content+'--');
}