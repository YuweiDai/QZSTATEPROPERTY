﻿//资产列表控制器
'use strict';
 
app.controller('PropertyRentEditCtrl', ['$window', '$rootScope', '$uibModal', '$state', '$scope', '$timeout', 'PropertyService', 'GovernmentService', 'w5cValidator','toaster',
    function ($window, $rootScope, $uibModal, $state, $scope, $timeout, propertyService, governmentService, w5cValidator, toaster) {
        $scope.swfUrl = $rootScope.baseUrl + 'vender/libs/webimgUploader/Uploader.swf';
        $scope.pictureUploadUrl = $rootScope.apiUrl + 'Media/pictures/Upload?size=500';
        $scope.fileUploadUrl = $rootScope.apiUrl + 'Media/files/Upload';
        $scope.processing = true;
        var id = $scope.approveId;
        $scope.rent = {
            name: "",
            rentTime: "",
            rentArea: 0,
            rentMonth: 0,
            rentPrice: 0,
            rentPictures: [],
            rentFiles: [],
            remark: "",
            dSuggestion: "",
            aSuggestion: "",
            submit: false,
            backTime: "",
            priceString: ""
        };

        propertyService.getRent(id).then(function (response) {

            $scope.rent = response.propertyRent;

            var renttime =$scope.rent.rentTime.split("-");
            var backtime =$scope.rent.backTime.split("-");
            var prices =$scope.rent.priceString.split(";");

            $scope.yearNumber = [];
            var num = backtime[0] - renttime[0];
            if (num <= 0) num = 1;
            for (var i = 1; i <= num; i++) {
                var d = {
                    index: i,
                    model: prices[i-1]
                }
                $scope.yearNumber.push(d);
            }

            $scope.rent.rentTime = moment($scope.rent.rentTime).format("YYYY/MM/DD") + " - " + moment($scope.rent.backTime).format("YYYY/MM/DD");


        }, function (message) {
            toaster.pop("error", "错误：" + message);
            $timeout(function () { $state.go("app.property.process_approve", { approveType: "rent" }); }, 550);
        }).finally(function () {
            $scope.processing = false;
        });


        //判断出租总年份
        $scope.rentTimeChange = function () {

            var timestring = $scope.rent.rentTime;
            var time = timestring.split("-");
            var backtime = moment(time[1]);
            var renttime = moment(time[0]);

            var diff = backtime.diff(renttime, "year", true);
            var num = Math.ceil(diff);
            $scope.yearNumber = [];
            for (var i = 1; i <= num; i++) {
                var p=  prices.length < i ? 0 : prices[i - 1];
                var d = {
                    index: i,
                    model:p
                }
                $scope.yearNumber.push(d);
            }
        }

        //验证
        w5cValidator.setRules({
            rentName: {
                required: "租用方名称不能为空"
            },
            daterange: {
                required: "出租时间不能为空"
            },
            rentArea: {
                required: "出租面积不能为空"
            },
            rentPrice: {
                required: "租用价格不能为空"
            },
        });

        var validation = $scope.validation = {
            options: {
                blurTrig: true
            }
        };
        //提交编辑
        validation.saveEntity = function ($event, submit) {
            $scope.processing = true;
            $scope.rent.submit = submit;
            $scope.rent.priceString = "";
            var timestring = $scope.rent.rentTime;
            var time = timestring.split("-");
            $scope.rent.rentTime = time[0];
            $scope.rent.backTime = time[1];

            angular.forEach($scope.yearNumber, function (data) {
                $scope.rent.priceString += data.model + ";";
            })

            propertyService.updateRent($scope.rent).then(function () {
                toaster.pop("sucess", "保存成功", "", 500);
                $timeout(function () {
                    if (submit) $state.go("app.property.process_approve", { approveType: "rent" });
                    else $state.reload();
                }, 550);
            }, function (message) {
                $scope.errorMsg = message;
                toaster.pop("error", "保存失败", "", 500);
            }).finally(function () {
                $scope.processing = false;
            });
        }
        //日期配置项         
        $scope.dateOption = {
            singleDatePicker: true,
            showDropdowns: true
        };

        $scope.dateRangeOption = {
            showDropdowns: true,
            autoApply: true,
            locale: {
                format: 'YYYY/MM/DD'
            }
        };
    }]);
