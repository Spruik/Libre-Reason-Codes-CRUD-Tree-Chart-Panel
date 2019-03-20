'use strict';

System.register(['app/core/core'], function (_export, _context) {
  "use strict";

  var appEvents, hostname, postgRestHost, influxHost, post, update, deleteMethod, get, alert, showModal, writeProductionLine, writeLine, getReasons;
  return {
    setters: [function (_appCoreCore) {
      appEvents = _appCoreCore.appEvents;
    }],
    execute: function () {
      hostname = window.location.hostname;

      _export('postgRestHost', postgRestHost = 'http://' + hostname + ':5436/');

      _export('postgRestHost', postgRestHost);

      _export('influxHost', influxHost = 'http://' + hostname + ':8086/');

      _export('influxHost', influxHost);

      _export('post', post = function post(url, line) {
        return new Promise(function (resolve, reject) {
          var xhr = new XMLHttpRequest();
          xhr.open('POST', url);
          xhr.onreadystatechange = handleResponse;
          xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
          xhr.onerror = function (e) {
            return reject(e);
          };
          xhr.send(line);

          function handleResponse() {
            if (xhr.readyState === 4) {
              if (xhr.status === 200) {
                // console.log('200');
                resolve(xhr.responseText);
              } else if (xhr.status === 204) {
                // console.log('204');
                resolve(xhr.responseText);
              } else if (xhr.status === 201) {
                resolve(xhr.responseText);
              } else {
                reject(xhr.responseText);
              }
            }
          }
        });
      });

      _export('post', post);

      _export('update', update = function update(url, line) {
        return new Promise(function (resolve, reject) {
          var xhr = new XMLHttpRequest();
          xhr.open('PATCH', url);
          xhr.onreadystatechange = handleResponse;
          xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
          xhr.onerror = function (e) {
            return reject(e);
          };
          xhr.send(line);

          function handleResponse() {
            if (xhr.readyState === 4) {
              if (xhr.status === 200) {
                // console.log('200');
                resolve(xhr.responseText);
              } else if (xhr.status === 204) {
                // console.log('204');
                resolve(xhr.responseText);
              } else if (xhr.status === 201) {
                resolve(xhr.responseText);
              } else {
                reject(xhr.responseText);
              }
            }
          }
        });
      });

      _export('update', update);

      _export('deleteMethod', deleteMethod = function deleteMethod(url) {
        return new Promise(function (resolve, reject) {
          var xhr = new XMLHttpRequest();
          xhr.open('DELETE', url);
          xhr.onreadystatechange = handleResponse;
          xhr.onerror = function (e) {
            return reject(e);
          };
          xhr.send();

          function handleResponse() {
            if (xhr.readyState === 4) {
              if (xhr.status === 200) {
                // console.log('200');
                resolve(xhr.responseText);
              } else if (xhr.status === 204) {
                // console.log('204');
                resolve(xhr.responseText);
              } else {
                reject(this.statusText);
              }
            }
          }
        });
      });

      _export('deleteMethod', deleteMethod);

      _export('get', get = function get(url) {
        return new Promise(function (resolve, reject) {
          var xhr = new XMLHttpRequest();
          xhr.open('GET', url);
          xhr.onreadystatechange = handleResponse;
          xhr.onerror = function (e) {
            return reject(e);
          };
          xhr.send();

          function handleResponse() {
            if (xhr.readyState === 4) {
              if (xhr.status === 200) {
                var res = JSON.parse(xhr.responseText);
                resolve(res);
              } else {
                reject(this.statusText);
              }
            }
          }
        });
      });

      _export('get', get);

      _export('alert', alert = function alert(type, title, msg) {
        appEvents.emit('alert-' + type, [title, msg]);
      });

      _export('alert', alert);

      _export('showModal', showModal = function showModal(html, data) {
        appEvents.emit('show-modal', {
          src: 'public/plugins/smart-factory-reason-codes-crud-tree-chart-panel/partials/' + html,
          modalClass: 'confirm-modal',
          model: data
        });
      });

      _export('showModal', showModal);

      _export('writeProductionLine', writeProductionLine = function writeProductionLine(data) {
        var postgresUrl = postgRestHost + 'equipment?site=eq.' + data.info.site;
        // + '&area=eq.' + rowData.Area + '&line=eq.' + rowData.Line
        switch (data.type) {
          case 'Site':
            break;
          case 'Area':
            postgresUrl += '&area=eq.' + data.info.area;
            break;
          case 'Line':
            postgresUrl += '&area=eq.' + data.info.area + '&production_line=eq.' + data.info.line;
            break;
          default:
            postgresUrl = null;
            break;
        }
        return postgresUrl;
      });

      _export('writeProductionLine', writeProductionLine);

      _export('writeLine', writeLine = function writeLine(data) {
        var postgresUrl = postgRestHost + 'reason_codes?category_id=eq.' + data.info.category;
        // + '&area=eq.' + rowData.Area + '&line=eq.' + rowData.Line
        switch (data.type) {
          case 'Category':
            break;
          case 'Parent Reason':
            postgresUrl += '&reason_id=eq.' + data.info.reason + '&parent_reason_id=is.null';
            break;
          case 'Reason':
            postgresUrl += '&reason_id=eq.' + data.info.reason + '&parent_reason_id=eq.' + data.parent;
            break;
          default:
            postgresUrl = null;
            break;
        }
        return postgresUrl;
      });

      _export('writeLine', writeLine);

      _export('getReasons', getReasons = function getReasons(node, allData) {
        var category = node.info.category;
        var reasons = allData.filter(function (d) {
          return d.category_id === category && d.reason_id !== null;
        }).reduce(function (arr, d) {
          arr.push(d.reason_id);
          return arr;
        }, []);
        reasons = Array.from(new Set(reasons));
        return reasons;
      });

      _export('getReasons', getReasons);
    }
  };
});
//# sourceMappingURL=utils.js.map
