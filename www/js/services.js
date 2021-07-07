function nullToEmpty(text) {
    if ( text == 'null' || text == undefined) {
        return '';
    } else {
        return text;
    }
}

angular.module('myApp').service('ClientService', function () {

	this.Places = function(){

		/*
			#####
				Inserts at 
					app_newclient.js
					app_changerequest.js 
			#####


		*/
		return 'omg';
	};
     
    this.getAllClientsFromCenter = function (centerid) {
        
        var promise = new $.Deferred();

	    	var cmd = "SELECT *  FROM T_CLIENT WHERE CLT_CENTER_ID="+centerid;
	    	myDB.execute(cmd,function(results){
	    		if(results.length > 0) promise.resolve(results);
	    		else promise.resolve(null);
	    	});

	    return promise;
    };
    this.getAllClientsFromGroup = function (centerid,groupid) {
        
    };
    this.getOneClient = function(clientpk){

    	var promise = new $.Deferred();

	    	var cmd = "SELECT T_CLIENT.*, VLM_NAME FROM T_CLIENT, T_VILLAGE_MASTER WHERE CLT_VILLAGE = VLM_PK AND CLT_PK ="+clientpk;
	    	myDB.execute(cmd,function(result){
	    		if(result.length > 0) promise.resolve(nullToEmpty(result[0]) );
	    		else promise.resolve(null);
	    	});

	    return promise;

    } ;

    this.getOneClientNewInfo = function(clientpk){

    	var promise = new $.Deferred();

	    	var cmd = "SELECT T_CLIENT_NEW.*, VLM_NAME FROM T_CLIENT_NEW, T_VILLAGE_MASTER WHERE CLT_VILLAGE = VLM_PK AND CLT_PK ="+clientpk;
	    	myDB.execute(cmd,function(result){
	    		if(result.length > 0) promise.resolve(nullToEmpty(result[0]) );
	    		else promise.resolve(null);
	    	});

	    return promise;

    } ; 


})

angular.module('myApp').service('LoanService', function () {

	this.Places = function(){

		/*
			#####
				Inserts at 
					app_newclient.js
					app_changerequest.js 
			##### 
		*/


		return 'omg';
	};
 

    this.getAllExistingLoans = function(clientpk){

    	var promise = new $.Deferred();

	    	var cmd = "SELECT * FROM T_CLIENT_LOAN, T_LOAN_PURPOSE  WHERE CLL_LPU_PK = LPU_PK AND CLL_CLT_PK="+clientpk+" AND  ( CLL_DISBURSEMENT_DATE != '' OR CLL_STATUS = 1 ) AND CLL_STATUS NOT IN (9,34) "; 
	    	myDB.execute(cmd,function(results){
	    		if(results.length > 0) promise.resolve(nullToEmpty(results) );
	    		else promise.resolve(null);
	    	});

	    return promise;

    } ;

    this.getAllLoanTypesAndLoanCycleofClient = function(clientpk){
    	var promise = new $.Deferred();

        var cmd = "SELECT lt.*,  COUNT(cl.CLL_PK) as loancycle FROM T_LOAN_TYPE as lt LEFT JOIN T_CLIENT_LOAN as cl ON (cl.CLL_LTY_PK = lt.LTY_PK AND cl.CLL_CLT_PK = "+clientpk+") GROUP BY lt.LTY_DESCRIPTION, lt.LTY_CODE order by lt.LTY_CODE";  
        myDB.execute(cmd,function(results){
            if(results.length > 0) promise.resolve(results);
            else promise.resolve(null);
        });

	    return promise;
    }

    this.getGeneralLoan = function(clientpk){
    	var promise = new $.Deferred();

        var cmd = "SELECT lt.*, cl.*, 0 as loancycle FROM T_LOAN_TYPE as lt LEFT JOIN T_CLIENT_LOAN as cl ON (cl.CLL_LTY_PK = lt.LTY_PK AND cl.CLL_CLT_PK = "+clientpk+") WHERE lt.LTY_CODE = '001.0001' AND cl.CLL_STATUS IN (64, 67) GROUP BY lt.LTY_DESCRIPTION, lt.LTY_CODE order by lt.LTY_CODE";  
        myDB.execute(cmd,function(results){
            if(results.length > 0) promise.resolve(results);
            else promise.resolve(null);
        });
	    return promise;
    }
})

angular.module('myApp').service('SavingService', function () {
 

    this.getAllProducts = function(clientpk){

    	var promise = new $.Deferred();

	    	var cmd = "SELECT * FROM T_PRODUCT_MASTER LEFT JOIN T_LOAN_SAVING_PRD_MAPPING ON (LSM_PRM_PK = PRM_PK) LEFT JOIN T_CLIENT_PRODUCT_MAPPING ON (CPM_PRM_PK=PRM_PK AND CPM_STATUS_PK= 56) WHERE CPM_CLT_PK = "+clientpk+" GROUP BY PRM_PK"; 
	    	myDB.execute(cmd,function(results){
	    		if(results.length > 0) promise.resolve(nullToEmpty(results) );
	    		else promise.resolve(null);
	    	});

	    return promise;

    }; 
    this.getAllMappedProducts = function(ltypk, cltpk){

    	var promise = new $.Deferred();

	    	var cmd = "SELECT * FROM T_PRODUCT_MASTER LEFT JOIN T_LOAN_SAVING_PRD_MAPPING ON (LSM_PRM_PK = PRM_PK) WHERE PRM_PK NOT IN (SELECT CPM_PRM_PK FROM T_CLIENT_PRODUCT_MAPPING WHERE CPM_CLT_PK="+ cltpk +" AND CPM_STATUS_PK IN (26,56)) AND PRM_PK NOT IN (77)  AND LSM_LTY_PK = "+ltypk+" GROUP BY PRM_PK"; 
	    	myDB.execute(cmd,function(results){
	    		if(results.length > 0) promise.resolve(nullToEmpty(results) );
	    		else promise.resolve(null);
	    	});

	    return promise;

    } ; 

    this.getAllMappedProductsForSecondLoan = function(cltpk){

    	var promise = new $.Deferred();

	    	var cmd = "SELECT * FROM T_PRODUCT_MASTER LEFT JOIN T_LOAN_SAVING_PRD_MAPPING ON (LSM_PRM_PK = PRM_PK) WHERE PRM_PK NOT IN (SELECT CPM_PRM_PK FROM T_CLIENT_PRODUCT_MAPPING WHERE CPM_CLT_PK="+ cltpk +" AND CPM_STATUS_PK IN (26,56)) AND PRM_PK NOT IN (77) AND PRM_CODE != '22400000'"; 
	    	myDB.execute(cmd,function(results){
	    		if(results.length > 0) promise.resolve(nullToEmpty(results) );
	    		else promise.resolve(null);
	    	});

	    return promise;

    } ; 
})