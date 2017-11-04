# Loopback-advancedmodel
Loopback 3.X advanced Promisified model with Object-oriented API Descriptor

# Installation 

```
npm install loopback-advancedmodel --save
``` 

# Example 

```js
'use strict';
const advancedmodel = require('loopback-advancedmodel');

const Book = new advancedmodel().disableAllMethods();

// Listen for dataSourceAttached event!
Book.on('dataSourceAttached',() => {
    console.log('Datasource attached to book model!');
});

async function findByTag({ params: [tag], model: bookModel}) {
    console.log(`Find book by tag => ${tag}`);
    let book = await bookModel.findOne({ where: {tag} });
    if(book == null) {
        book = await bookModel.create({
            name: 'Example book!',
            tag
        });
    }
    console.log(book);
    return book;
}

// Register findByTag method!
Book.registerRemoteMethod(findByTag)
    .http('/findByTag/:tag')
    .accept({ arg: 'tag', type: 'string'})
    .returns({ arg: 'book', type: 'object' });

module.exports = Book.export();
``` 

# API Documentation

> Work in progress

# Roadmap 

- Better API Descriptor support 
- Method to register new property