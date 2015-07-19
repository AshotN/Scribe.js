(function () {

    'use strict';

    /**
     * Logs controller
     */

    window.app.controller('logsController', [
        '$scope',
        '$rootScope',
        'ScribeAPI',
        'logs',
        function ($scope, $rootScope, ScribeAPI, logs) {

            //reset
            $rootScope.sidebar = false;

            $scope.placeholder = false;

            /**
             * attachCurrentFiles
             *
             * Attach current files to $scope
             * If no current files, redirect to home
             *
             * @type {Function}
             */
            var attachCurrentFiles = function (currentFiles) {
                //if no files, redirect to home
                if (currentFiles.length === 0) {
                    $rootScope.go('/');
                }
                $scope.currentFiles = currentFiles;
            };

            var extractLines = function (res) {
                var lines = res.match(/[^\r\n]+/g); //cut lines

                lines = lines.map(function (line) {
                    try {
                        return JSON.parse(line);
                    } catch (e) {
                        return line;
                    }
                });

                return lines;
            }

            /**
             * getCurrentLogs
             *
             * Get content of each current files
             * And push all the lines in `$scope.lines`
             *
             * @type {Function}
             */
            var getCurrentLogs = function () {

                $scope.currentFiles.forEach(function (file) {

                    if (file.selected) {

                        var xhr = new XMLHttpRequest();
                        var data = '';

                        xhr.open('GET', 'api/log?path=' + encodeURIComponent(file.path), true);

                        xhr.onprogress = function () {
                            var contentLength = this.getResponseHeader('content-length');
                            $scope.$apply(function () {
                                $scope.placeholder = true;
                                document.getElementById('progessbar').style.width = (xhr.response.length / contentLength) * 100 + 'px';
                                //document.getElementById('placeholder').innerHTML = extractLines(xhr.response).map(function (line) {
                                //    return '<div class="log"><span class="log__item log_message">' + line.message + '</span></div>';
                                //}).join('');
                            });
                        }

                        xhr.onload = function () {
                            var lines = extractLines(xhr.response);

                            if (!Array.isArray($scope.lines)) {
                                $scope.lines = [];
                            }

                            setTimeout(function () {
                                $scope.$apply(function () {
                                    $scope.placeholder = false;
                                    $scope.lines = $scope.lines.concat(lines);
                                });
                            }, 2000);
                        }

                        xhr.onerror = function (err) {
                            console.error(err);
                        }

                        xhr.send();

                        //ScribeAPI.log({
                        //    path : file.path
                        //}, function (data) {
                        //
                        //    //var lines = data.match(/[^\r\n]+/g); //cut lines
                        //    //
                        //    //return lines.map(function (line) {
                        //    //    try {
                        //    //        return JSON.parse(line);
                        //    //    } catch (e) {
                        //    //        return line;
                        //    //    }
                        //    //});
                        //    if (!Array.isArray($scope.lines)) {
                        //        $scope.lines = [];
                        //    }
                        //    $scope.lines = $scope.lines.concat(data);
                        //});
                    }

                });
            };

            /**
             * selectAll
             *
             * Select all current files
             *
             * @params {Boolean} select     True: select / False: unselect
             * @type   {Function}
             */
            var selectAll = function (select) {
                $scope.currentFiles = $scope.currentFiles.map(function (file) {
                    file.selected = select;
                    return file;
                });
            };


            /**
             * Init $sope values
             */

                //ng-toggle values
                //3 states : 1 / null / 0
            $scope.showFile = 0;
            $scope.showTime = 0;
            $scope.showDate = 1;
            $scope.showTags = 1;
            $scope.showDuration = 1;

            //Stores all lines (a line = a log)
            $scope.lines = false;

            //default order by time
            $scope.order = "context.time";
            //order reverse
            $scope.reverse = true;

            /**
             * $scope.addFile
             *
             * Add a file to current files
             *
             * @param {String} path     Its path (with logWriter dir)
             * @type  {Function}
             */
            $scope.addFile = function (path) {
                if (path !== "") {
                    attachCurrentFiles(logs.addLog(path, true));
                }
                $scope.fileToAdd = "";
            };

            /**
             * $scope.reload
             *
             * Reload all selected files
             * @type {Function}
             */
            $scope.reload = function () {
                $scope.lines = false;
                attachCurrentFiles(logs.getLogs());
                getCurrentLogs();
            };

            $scope.reload();


            /**
             * Watchers
             */

                //watch current files for changes
                //as user can select / unselect files in sidebar
            $scope.$watch('currentFiles', function (value, old) {
                $scope.lines = false;
                if (value !== old) {
                    getCurrentLogs();
                }
            }, true);

            //watch selectAll checkbox
            //to select all current files
            $scope.$watch('selectAll', function (value, old) {
                if (value !== old) {
                    selectAll(value);
                }
            });

        }
    ]);

}());
