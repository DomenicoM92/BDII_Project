var fs = require('fs');
var csv = require('csv-parse');
var objectCollection = [];
var codice_regione, codice_provincia, codice_comune, denominazione_comune, sigla_provincia, popolazione_censita,
  titolo_accademico, cognome, nome, sesso, data_nascita, luogo_nascita, descrizione_carica, data_elezione,
  data_entrata_in_carica, partito, titolo_studio, professione;
exports.datasetHandler = function (MongoClient, urlDB) {

  var inputFile = 'dataset/ammcom.csv';
  var index = -1;
  fs.createReadStream(inputFile)
    .pipe(csv())
    .on('data', function (data) {
      try {
        index++;
        JSONBuilder(data, index);
      }
      catch (err) {
        //error handler
      }
    })
    .on('end', function () {
      MongoClient.connect(urlDB, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;
        var dbo = db.db("AmministrazioniComunali_DB");
        dbo.collection("Ammcom").insertMany(objectCollection, function (err, res) {
          if (err) throw err;
          console.log("Collecinserted");
          db.close();
        });
        dbo.collection("Ammcom").createIndexes(
          [
            { name: 'codice_regione', key: { denominazione_comune: 1 } },
            { name: 'partito', key: { partito: 1 } },
            { name: 'titolo_studio', key: { titolo_studio: 1 } }
          ],
          function (err, result) {
            //Error handling code
            console.log(err);
          }
        );
      });
    });
}
exports.groupGenderByRegion = function (MongoClient, urlDB) {
  return new Promise(function (fulfill, reject) {
    MongoClient.connect(urlDB, { useNewUrlParser: true }, function (err, db) {
      if (err) throw err;
      var dbo = db.db("AmministrazioniComunali_DB");
      dbo.collection("Ammcom").aggregate([
        {
          '$match': {
            'descrizione_carica': 'Sindaco'
          }
        }, {
          '$group': {
            '_id': '$codice_regione', 
            'Men': {
              '$sum': {
                '$cond': {
                  'if': {
                    '$eq': [
                      '$sesso', 'M'
                    ]
                  }, 
                  'then': 1, 
                  'else': 0
                }
              }
            }, 
            'Women': {
              '$sum': {
                '$cond': {
                  'if': {
                    '$eq': [
                      '$sesso', 'F'
                    ]
                  }, 
                  'then': 1, 
                  'else': 0
                }
              }
            }
          }
        }, {
          '$sort': {
            '_id': 1
          }
        }
      ]).toArray((err, results) => {
        fulfill(results)
      });
    });
  });
}
exports.groupTitlesByRegion = function (MongoClient, urlDB) {
  return new Promise(function (fulfill, reject) {
    MongoClient.connect(urlDB, { useNewUrlParser: true }, function (err, db) {
      if (err) throw err;
      var dbo = db.db("AmministrazioniComunali_DB");
      dbo.collection("Ammcom").aggregate([
        {
          '$match': {
            'descrizione_carica': 'Sindaco'
          }
        }, {
          '$group': {
            '_id': '$codice_regione', 
            'LICENZA_ELEMENTARE': {
              '$sum': {
                '$cond': {
                  'if': {
                    '$eq': [
                      '$titolo_studio', 'LICENZA ELEMENTARE'
                    ]
                  }, 
                  'then': 1, 
                  'else': 0
                }
              }
            }, 
            'LICENZA_MEDIA_INF': {
              '$sum': {
                '$cond': {
                  'if': {
                    '$eq': [
                      '$titolo_studio', 'LICENZA MEDIA INFERIORE'
                    ]
                  }, 
                  'then': 1, 
                  'else': 0
                }
              }
            }, 
            'LICENZA_MEDIA_SUP': {
              '$sum': {
                '$cond': {
                  'if': {
                    '$eq': [
                      '$titolo_studio', 'LICENZA MEDIA SUPERIORE'
                    ]
                  }, 
                  'then': 1, 
                  'else': 0
                }
              }
            }, 
            'LAUREA': {
              '$sum': {
                '$cond': {
                  'if': {
                    '$eq': [
                      '$titolo_studio', 'LAUREA'
                    ]
                  }, 
                  'then': 1, 
                  'else': 0
                }
              }
            }, 
            'DOTTORATO': {
              '$sum': {
                '$cond': {
                  'if': {
                    '$eq': [
                      '$titolo_studio', 'DOTTORATO DI RICERCA'
                    ]
                  }, 
                  'then': 1, 
                  'else': 0
                }
              }
            }
          }
        }, {
          '$sort': {
            '_id': 1
          }
        }
      ]).toArray((err, results) => {
        fulfill(results)
      });
    });
  });
}
exports.groupParByRegion = function (MongoClient, urlDB) {
  return new Promise(function (fulfill, reject) {
    MongoClient.connect(urlDB, { useNewUrlParser: true }, function (err, db) {
      if (err) throw err;
      var dbo = db.db("AmministrazioniComunali_DB");
      dbo.collection("Ammcom").aggregate([
        {
          '$group': {
            '_id': '$titolo_studio', 
            'LEGA': {
              '$sum': {
                '$cond': {
                  'if': {
                    '$and': [
                      {
                        '$eq': [
                          '$partito', 'LEGA'
                        ]
                      }, {
                        '$or': [
                          {
                            '$eq': [
                              '$titolo_studio', 'LICENZA ELEMENTARE'
                            ]
                          }, {
                            '$eq': [
                              '$titolo_studio', 'LICENZA MEDIA INFERIORE'
                            ]
                          }, {
                            '$eq': [
                              '$titolo_studio', 'LICENZA MEDIA SUPERIORE'
                            ]
                          }, {
                            '$eq': [
                              '$titolo_studio', 'LAUREA'
                            ]
                          }, {
                            '$eq': [
                              '$titolo_studio', 'DOTTORATO DI RICERCA'
                            ]
                          }
                        ]
                      }
                    ]
                  }, 
                  'then': 1, 
                  'else': 0
                }
              }
            }, 
            'PD': {
              '$sum': {
                '$cond': {
                  'if': {
                    '$and': [
                      {
                        '$eq': [
                          '$partito', 'PARTITO DEMOCRATICO'
                        ]
                      }, {
                        '$or': [
                          {
                            '$eq': [
                              '$titolo_studio', 'LICENZA ELEMENTARE'
                            ]
                          }, {
                            '$eq': [
                              '$titolo_studio', 'LICENZA MEDIA INFERIORE'
                            ]
                          }, {
                            '$eq': [
                              '$titolo_studio', 'LICENZA MEDIA SUPERIORE'
                            ]
                          }, {
                            '$eq': [
                              '$titolo_studio', 'LAUREA'
                            ]
                          }, {
                            '$eq': [
                              '$titolo_studio', 'DOTTORATO DI RICERCA'
                            ]
                          }
                        ]
                      }
                    ]
                  }, 
                  'then': 1, 
                  'else': 0
                }
              }
            }, 
            'FI': {
              '$sum': {
                '$cond': {
                  'if': {
                    '$and': [
                      {
                        '$eq': [
                          '$partito', 'FORZA ITALIA'
                        ]
                      }, {
                        '$or': [
                          {
                            '$eq': [
                              '$titolo_studio', 'LICENZA ELEMENTARE'
                            ]
                          }, {
                            '$eq': [
                              '$titolo_studio', 'LICENZA MEDIA INFERIORE'
                            ]
                          }, {
                            '$eq': [
                              '$titolo_studio', 'LICENZA MEDIA SUPERIORE'
                            ]
                          }, {
                            '$eq': [
                              '$titolo_studio', 'LAUREA'
                            ]
                          }, {
                            '$eq': [
                              '$titolo_studio', 'DOTTORATO DI RICERCA'
                            ]
                          }
                        ]
                      }
                    ]
                  }, 
                  'then': 1, 
                  'else': 0
                }
              }
            }, 
            'FRATELLI_D': {
              '$sum': {
                '$cond': {
                  'if': {
                    '$and': [
                      {
                        '$eq': [
                          '$partito', 'LEGA'
                        ]
                      }, {
                        '$or': [
                          {
                            '$eq': [
                              '$titolo_studio', 'LICENZA ELEMENTARE'
                            ]
                          }, {
                            '$eq': [
                              '$titolo_studio', 'LICENZA MEDIA INFERIORE'
                            ]
                          }, {
                            '$eq': [
                              '$titolo_studio', 'LICENZA MEDIA SUPERIORE'
                            ]
                          }, {
                            '$eq': [
                              '$titolo_studio', 'LAUREA'
                            ]
                          }, {
                            '$eq': [
                              '$titolo_studio', 'DOTTORATO DI RICERCA'
                            ]
                          }
                        ]
                      }
                    ]
                  }, 
                  'then': 1, 
                  'else': 0
                }
              }
            }, 
            'M5S': {
              '$sum': {
                '$cond': {
                  'if': {
                    '$and': [
                      {
                        '$eq': [
                          '$partito', 'MOVIMENTO 5 STELLE'
                        ]
                      }, {
                        '$or': [
                          {
                            '$eq': [
                              '$titolo_studio', 'LICENZA ELEMENTARE'
                            ]
                          }, {
                            '$eq': [
                              '$titolo_studio', 'LICENZA MEDIA INFERIORE'
                            ]
                          }, {
                            '$eq': [
                              '$titolo_studio', 'LICENZA MEDIA SUPERIORE'
                            ]
                          }, {
                            '$eq': [
                              '$titolo_studio', 'LAUREA'
                            ]
                          }, {
                            '$eq': [
                              '$titolo_studio', 'DOTTORATO DI RICERCA'
                            ]
                          }
                        ]
                      }
                    ]
                  }, 
                  'then': 1, 
                  'else': 0
                }
              }
            }
          }
        }, {
          '$match': {
            '_id': {
              '$in': [
                'LAUREA', 'DOTTORATO DI RICERCA', 'LICENZA ELEMENTARE', 'LICENZA MEDIA INFERIORE', 'LICENZA MEDIA SUPERIORE'
              ]
            }
          }
        }, {
          '$sort': {
            '_id': 1
          }
        }
      ]).toArray((err, results) => {
        fulfill(results)
      });
    });
  });
}
exports.groupParByAvarageAge = function (MongoClient, urlDB) {
  return new Promise(function (fulfill, reject) {
    MongoClient.connect(urlDB, { useNewUrlParser: true }, function (err, db) {
      if (err) throw err;
      var dbo = db.db("AmministrazioniComunali_DB");
      dbo.collection("Ammcom").aggregate([
        {
          '$group': {
            '_id': '$partito', 
            'medium_age': {
              '$avg': '$età'
            }
          }
        }, {
          '$match': {
            '$or': [
              {
                '_id': 'LEGA'
              }, {
                '_id': 'PARTITO DEMOCRATICO'
              }, {
                '_id': 'FORZA ITALIA'
              }, {
                '_id': 'FRATELLI D\'ITALIA'
              }, {
                '_id': 'MOVIMENTO 5 STELLE'
              }
            ]
          }
        }, {
          '$sort': {
            'medium_age': 1
          }
        }
      ]).toArray((err, results) => {
        fulfill(results)
      });
    });
  });
}

exports.groupStudyTitleByPar= function(MongoClient, urlDB){
  return new Promise(function (fulfill, reject) {
    MongoClient.connect(urlDB, { useNewUrlParser: true }, function (err, db) {
      if (err) throw err;
      var dbo = db.db("AmministrazioniComunali_DB");
      dbo.collection("Ammcom").aggregate([
  {
    '$match': {
      'partito': {
        '$in': [
          'FRATELLI D\'ITALIA', 'MOVIMENTO 5 STELLE', 'FORZA ITALIA', 'PARTITO DEMOCRATICO', 'LEGA'
        ]
      }
    }
  }, {
    '$group': {
      '_id': '$partito', 
      'licenzaelementare': {
        '$sum': {
          '$cond': {
            'if': {
              '$eq': [
                '$titolo_studio', 'LICENZA ELEMENTARE'
              ]
            }, 
            'then': 1, 
            'else': 0
          }
        }
      }, 
      'licenzamediainf': {
        '$sum': {
          '$cond': {
            'if': {
              '$eq': [
                '$titolo_studio', 'LICENZA MEDIA INFERIORE'
              ]
            }, 
            'then': 1, 
            'else': 0
          }
        }
      }, 
      'licenzamediasup': {
        '$sum': {
          '$cond': {
            'if': {
              '$eq': [
                '$titolo_studio', 'LICENZA MEDIA SUPERIORE'
              ]
            }, 
            'then': 1, 
            'else': 0
          }
        }
      }, 
      'laurea': {
        '$sum': {
          '$cond': {
            'if': {
              '$eq': [
                '$titolo_studio', 'LAUREA'
              ]
            }, 
            'then': 1, 
            'else': 0
          }
        }
      }, 
      'dottorato': {
        '$sum': {
          '$cond': {
            'if': {
              '$eq': [
                '$titolo_studio', 'DOTTORATO DI RICERCA'
              ]
            }, 
            'then': 1, 
            'else': 0
          }
        }
      }
    }
  }, {
    '$sort': {
      '_id': 1
    }
  }
]).toArray((err, results) => {
        fulfill(results)
      });
    });
  });
}

function JSONBuilder(data, index) {

  if (index == 2) {
    codice_regione = data[0], codice_provincia = data[1], codice_comune = data[2], denominazione_comune = data[3],
      sigla_provincia = data[4], popolazione_censita = data[5], titolo_accademico = data[6], cognome = data[7],
      nome = data[8], sesso = data[9], data_nascita = data[10], luogo_nascita = data[11], descrizione_carica = data[12],
      data_elezione = data[13], data_entrata_in_carica = data[14], partito = data[15], titolo_studio = data[16],
      professione = data[17];
  }
  if (index > 2) {
    myObj = new Object();
    myObj[codice_regione] = regionByName(data[0]),
      myObj[codice_provincia] = data[1],
      myObj[codice_comune] = data[2],
      myObj[denominazione_comune] = data[3],
      myObj[sigla_provincia] = data[4],
      myObj[popolazione_censita] = data[5],
      myObj[titolo_accademico] = data[6],
      myObj[cognome] = data[7],
      myObj[nome] = data[8],
      myObj[sesso] = data[9],
      myObj[data_nascita] = data[10],
      myObj["età"] = getAge(data[10]),
      myObj[luogo_nascita] = data[11],
      myObj[descrizione_carica] = data[12],
      myObj[data_elezione] = data[13],
      myObj[data_entrata_in_carica] = data[14],
      myObj[partito] = data[15],
      myObj[titolo_studio] = standardizationTitleOfStudy(data[16]),
      myObj[professione] = data[17];
    objectCollection.push(myObj);
  }
}
function regionByName(regionCode) {
  var regionName;
  switch (regionCode) {
    case "1": regionName = "Pie"; break;
    case "2": regionName = "V.A"; break;
    case "3": regionName = "Lom"; break;
    case "4": regionName = "T.A.A"; break;
    case "5": regionName = "Ven"; break;
    case "6": regionName = "F.V.G"; break;
    case "7": regionName = "Lig"; break;
    case "8": regionName = "E.Rom"; break;
    case "9": regionName = "Tos"; break;
    case "10": regionName = "Umb"; break;
    case "11": regionName = "Mar"; break;
    case "12": regionName = "Laz"; break;
    case "13": regionName = "Abb"; break;
    case "14": regionName = "Mol"; break;
    case "15": regionName = "Cam"; break;
    case "16": regionName = "Pug"; break;
    case "17": regionName = "Bas"; break;
    case "18": regionName = "Cal"; break;
    case "19": regionName = "Sic"; break;
    case "20": regionName = "Sar"; break;
  }
  return regionName;
}
function standardizationTitleOfStudy(title) {
  if (title.includes('LICENZA ELEMENTARE')) {
    return 'LICENZA ELEMENTARE';
  } else if (title.includes('LICENZA MEDIA INFERIORE') || title.includes('LICENZA DI SCUOLA MEDIA INF. O TITOLI EQUIPOLLENTI')) {
    return 'LICENZA MEDIA INFERIORE';
  } else if (title.includes('LICENZA MEDIA SUPERIORE') || title.includes('LICENZA DI SCUOLA MEDIA SUP. O TITOLI EQUIPOLLENTI') ||
    title.includes("TITOLI O DIPLOMI PROFESSIONALI POST MEDIA INFER.") || title.includes("TITOLI O DIPLOMI PROFESSIONALI POST MEDIA SUPER.")) {
    return 'LICENZA MEDIA SUPERIORE';
  } else if (title.includes('LAUREA') || title.includes('LAUREA BREVE')) {
    return "LAUREA";
  } else if (title.includes('DOTTORATO DI RICERCA') || title.includes('TITOLI POST LAUREA / DOTTORATO DI RICERCA')) {
    return "DOTTORATO DI RICERCA";
  } else {
    return "Informazione mancante";
  }

}
function getAge(dateString) {
  var now = new Date();
  var yearNow = now.getYear();
  var monthNow = now.getMonth();
  var dateNow = now.getDate();
  var dob = new Date(dateString.substring(6, 10),
    dateString.substring(0, 2) - 1,
    dateString.substring(3, 5)
  );
  var yearDob = dob.getYear();
  var monthDob = dob.getMonth();
  var dateDob = dob.getDate();
  var age = {};
  yearAge = yearNow - yearDob;

  if (monthNow >= monthDob)
    var monthAge = monthNow - monthDob;
  else {
    yearAge--;
    var monthAge = 12 + monthNow - monthDob;
  }

  if (dateNow >= dateDob)
    var dateAge = dateNow - dateDob;
  else {
    monthAge--;
    var dateAge = 31 + dateNow - dateDob;

    if (monthAge < 0) {
      monthAge = 11;
      yearAge--;
    }
  }
  age = {
    years: yearAge,
    months: monthAge,
    days: dateAge
  };
  return age.years;
}