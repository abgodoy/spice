var app = angular.module('spiceDirectory', ['angularUtils.directives.dirPagination', 'ui.bootstrap']);

app.controller('spiceListing', function ($scope, $http) {
    $scope.pageSize = 6; // number of items per page
    $scope.pagination = {
        current: 1
    }; //set starting page to 1
    $scope.reverse = true; // initial sorting direction

    $scope.full_list = "";  // variable that will hold all the data
    $scope.entries = "";  //initialize variable for all the objects

    // $scope.unique_categories = [];

    $http.get(jsonFeed).success(function (response) {
        console.log("file loaded");
        //this will display html entities encoded for json correclty
        var newObjArray = response.entries.map(function (obj) { // loop through array
            for (var key in obj) { // loop through object properties
                if (typeof obj[key] === 'string') { // only if the value is a string type
                    obj[key] = htmlDecode(obj[key]); // same logic as you were using before
                }
            }
            return obj;
        });

        $scope.affiliations = response.affiliations;
        $scope.entries = newObjArray;
        $scope.competition_years = getCompetitionYears(newObjArray);
        $scope.entries = addImageInfo(newObjArray);

    }).error(function (response) {
        console.log('Error: ' + response);
    });

    // Reset page to 1 when search input changes
    $scope.changeHandler = function () {
        $scope.pagination = {
            current: 1
        };
    };

    $scope.getCategory = function (category) {
        
        var objects_to_categorize = $scope.full_list;
        $scope.entries = filterByCategory(objects_to_categorize, category);

    }

});

function htmlDecode(inp) {
    var replacements = {
        '&lt;': '<', '&gt;': '>', '&sol;': '/', '&quot;': '"', '&apos;': '\'', '&amp;': '&', '&laquo;': '«', '&raquo;': '»', '&nbsp;': ' ', '&copy;': '©', '&reg;': '®', '&deg;': '°'
    };
    for (var r in replacements) {
        inp = inp.replace(new RegExp(r, 'g'), replacements[r]);
    }
    return inp.replace(/&#(\d+);/g, function (match, dec) {
        return String.fromCharCode(dec);
    });
}

// Add 'site:' to list of safe urls so it works on internal Cascade links
app.config([
    '$compileProvider',
    function ($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|site):/);
    }
]);


// College division
app.filter("college", function(){
  return function(input, option){

    var output = [];
	var output_science = [];
    var opt = "";

	if (option != undefined){
		
	  console.log('college:  ' +option);
      opt = option.replaceAll(",",""); 
	  
      if (opt == 'all') {
        angular.forEach(input, function(value, key){
            output.push(value);
        });
        console.log('option: ' +opt);
      } else {
        angular.forEach(input, function(value, key){
		  primary_college = value['primary-college'].replaceAll(",", "");
          if( primary_college.includes(opt) ){
            output.push(value);
			console.log('PUSHED');
          }
		  
		  //code block below collects entries for 'Science' only, since code block above will also 
		  //push 'Letters, Arts and Social Science' into the resulting array
		  if( primary_college == 'Science' ) { 
			  output_science.push(value);
		  }

        });
      }
    } else {
	  console.log('college option is null');
      output = input;
    }
	
	if ( opt == 'Science' ) {  // if dropdown option is 'Science' assign output and return the collection for 'Science' only
		output = output_science;
	}
	
    return output;
  }
});

// Competition type
app.filter("competition", function() {
  return function(input, option) {
    var output = [];

    var opt = "";
    var tmp = "";
    
    if (option != undefined) {
      console.log('competition type: ' + option);
      angular.forEach(input, function(value, key) {
        type = value.type.toLowerCase();
        console.log("type: " +type);


        if(option == type) {
            output.push(value);
        } 

        if (option == "all"){
            output = input;
        }

      }); //end forEach

    } else {
      output = input;
    }

    return output;
  }
});

// get the unique competition years based on array
function getCompetitionYears (arr) {

    var unique_set = [];

    for (let i=0; i<arr.length; i++) {
        if(unique_set.indexOf(arr[i]['competition-year']) < 0) {
            unique_set.push(arr[i]['competition-year']);
        }
    }

    console.log(unique_set);
    return unique_set;

}

// Competition year
app.filter("year", function() {
    return function(input, option) {
      var output = [];
  
      var opt = "";
      var tmp = "";
      
      if (option != undefined) {
        
        angular.forEach(input, function(value, key) {
          year = value['competition-year'];
          // console.log("year: " +year);
  
  
          if(option == year) {
              output.push(value);
          } 
  
          if (option == "all"){
              output = input;
          }
  
        }); //end forEach
  
      } else {
        output = input;
      }
  
      return output;
    }
});

function addImageInfo(arr) {
  
  for(let i=0; i<arr.length; i++){
    var applicant = arr[i].applicant;
    var type = arr[i].type;

    // add image alt
    arr[i]['image-alt'] = type + " - " +applicant;

    applicant = applicant.toLowerCase();
    type = type.toLowerCase();

    var image = applicant + "-" + type;
    image = image.replaceAll(" ", "-");

    // add image file info
    arr[i]['profile-image'] = image;
  }

  return arr;

}




