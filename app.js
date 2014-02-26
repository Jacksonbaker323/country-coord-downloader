//https://github.com/MatthewMueller/cheerio
//http://justinklemm.com/node-js-async-tutorial/
//https://github.com/mikeal/request
//http://blog.miguelgrinberg.com/post/easy-web-scraping-with-nodejs
var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var json2csv = require('json2csv');
var fs = require('fs');
var base_url = "http://en.wikipedia.org";
var async_tasks = [];
var country_list = [];

request('http://en.wikipedia.org/wiki/ISO_3166-1', function(req, res, body) {
    $ = cheerio.load(body);
    $('table.sortable').find('tr').each(function(){
        var obj = {"country": {}};
        obj.name = this.first('td').find('a').attr('title');
        var url = this.first('td').find('a').attr('href');
        async_tasks.push(function(callback){
            request(base_url + url, function(req, res, body) {
                $ = cheerio.load(body);
                console.log($('title').text());
                obj.lat = $('.geography .latitude').text();
                obj.lon = $('.geography .longitude').text();    
                country_list.push(obj);
                callback();
            });
        });
    });
    async.parallel(async_tasks, function(){
        json2csv({data: country_list, fields: ['name', 'lat', 'lon']}, function (err, csv){
            fs.writeFile('countries.csv', csv, function(err){
                if (err) {
                    console.log(err);
                } else {
                    console.log('file saved');
                }
           });
        });
    });
});
