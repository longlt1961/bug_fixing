/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

// Add type declarations for MarsDB to improve type safety
declare module 'marsdb' {
  export class Collection {
    constructor(name: string);
  }
}
import * as MarsDB from 'marsdb';

export const reviewsCollection = new MarsDB.Collection('posts')
export const ordersCollection = new MarsDB.Collection('orders')