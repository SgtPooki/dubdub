'use strict';

var $ = require('jquery');
var algolia = require('./algolia');
var url = require('url');

/////////////////////////////////////////////////
// Algolia Config
var urlPathName = url.parse(location.href).pathname;
urlPathName = stripTrailingSlash(urlPathName);
if (urlPathName === '/search') {
  algolia.init();
  algolia.config.APPLICATION_ID = '7FI9T0IXZ5';
  algolia.config.SEARCH_ONLY_API_KEY = 'b998ea87dc6edcbdf733d2796f8eccf7';
  algolia.config.INDEX_NAME = 'prismic_products';
  algolia.config.FACET_CONFIG = [
    { name: 'fragments.product.flavour.value', title: 'flavor', disjunctive: true, sortFunction: algolia.sortByName, topListIfRefined: true },
    { name: 'fragments.product.name.value.text', title: 'name', disjunctive: true, sortFunction: algolia.sortByName, topListIfRefined: true }
  ];
} else if (urlPathName === '/examples/search-best-buy') {
  algolia.init();
  algolia.config.APPLICATION_ID = 'latency';
  algolia.config.SEARCH_ONLY_API_KEY = '6be0576ff61c053d5f9a3225e2a90f76';
  algolia.config.INDEX_NAME = 'bestbuy';
  algolia.config.FACET_CONFIG = [
  { name: 'type', title: 'Type', disjunctive: false, sortFunction: algolia.sortByCountDesc },
  { name: 'shipping', title: 'Shipping', disjunctive: false, sortFunction: algolia.sortByCountDesc },
  { name: 'customerReviewCount', title: '# Reviews', disjunctive: true, type: 'slider' },
  { name: 'category', title: 'Category', disjunctive: true, sortFunction: algolia.sortByCountDesc, topListIfRefined: true },
  { name: 'salePrice_range', title: 'Price range', disjunctive: true, sortFunction: algolia.sortByName },
  { name: 'manufacturer', title: 'Manufacturer', disjunctive: true, sortFunction: algolia.sortByName, topListIfRefined: true }
  ];
}
algolia.config.HITS_PER_PAGE = 10;
algolia.config.MAX_VALUES_PER_FACET = 30;
/////////////////////////////////////////////////

function stripTrailingSlash(str) {
    if(str.substr(-1) === '/') {
        return str.substr(0, str.length - 1);
    }
    return str;
}
