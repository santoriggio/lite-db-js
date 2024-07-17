# lite-db-js

`lite-db-js` is a lightweight JavaScript library that simulates the structure of Firestore locally. It allows you to create collections, add documents, perform complex queries, and add listeners to document changes. This library is ideal for applications that need a local database with Firestore-like capabilities.

## Table of Contents

1. [Introduction](#introduction)
2. [Features](#features)
3. [Installation](#installation)
4. [Usage](#usage)
   - [Initialization](#initialization)
   - [Basic Operations](#basic-operations)
   - [Advanced Operations](#advanced-operations)

## Introduction

`lite-db-js` aims to provide a local database solution with a structure and functionalities similar to Firestore. This library is particularly useful for applications that require a local database to manage collections and documents, and to listen for changes in data.

## Features

- Create collections and add documents.
- Perform complex queries on collections.
- Add listeners for document and collection changes.
- Lightweight and easy to integrate.

## Installation

You can install `lite-db-js` using npm:

```sh
npm install lite-db-js
```

## Usage

### Initialization

To use `lite-db-js`, you need to import the `DB` class and create an instance:

```javascript
import DB from "lite-db-js";

const db = new DB();
```

### Basic Operations

#### Creating a Collection

To create a collection, use the `collection` method on your `DB` instance:

```javascript
const usersCollection = db.collection("users");
```

#### Adding documents

To add documents to a collection use the method 'add'
You can pass an array or a single element

```javascript
const users = [
  {
    name: "John",
    age: 25,
    email: "john@example.com",
  },
  {
    name: "Alice",
    age: 33,
    email: "alice@example.com",
  },
];

usersCollection.add(users);
```

#### Querying Documents

You can perform queries on collections using methods like 'where', 'orderBy'.

```javascript
const query = usersCollection.where("age", ">", 30);

console.log(query.count); // Numbers of documents

if (query.empty === false) {
  query.docs.forEach((doc) => {
    console.log(doc.data); // Document data
  });
}
```

#### Listening to Document Changes

You can listen to real-time updates on a collection or document using 'on':

```javascript
const listener = query.on((snapshot) => {
  if (snapshot.empty === false) {
    snapshot.docs.forEasch((doc) => {
      console.log(doc.data); // Document data
    });
  }
});

listener.remove();

const document = query.doc("uidDocument").set({
  name: "Alex",
  age: 44,
  email: "alex@example.com",
});

const docListener = document.on((snapshot) => {
  if (snapshot.exists) {
    console.log(snapshot.data); // Document data
  }
});

docListener.remove();
```
