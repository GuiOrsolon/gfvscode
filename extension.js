const vscode = require('vscode');

const functions = require('./functions');

function activate(context) {

  context.subscriptions.push(
		vscode.commands.registerCommand('gfvscode.createApp', function(){
			functions.createApp();
		})
	);	

	context.subscriptions.push(
		vscode.commands.registerCommand('gfvscode.createPlugin', function(){
			functions.createPlugin();
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('gfvscode.runnApp', function(){
			functions.runApp();
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('gfvscode.stopApp', function(){
			functions.stopApp();
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('gfvscode.runCommand', function(){
			functions.grailsRunCommand();
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('gfvscode.cleanProject', function(){
			functions.cleanProject();
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('gfvscode.compile', function(){
			functions.compileProject();
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('gfvscode.dependencyReport', function(){
			functions.showDependencyReport();
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('gfvscode.help', function(){
			functions.showHelp();
		})
	);	

	context.subscriptions.push(
		vscode.commands.registerCommand('gfvscode.listPlugins', function(){
			functions.listPlugins();
		})
	);	

	context.subscriptions.push(
		vscode.commands.registerCommand('gfvscode.console', function(){
			functions.showConsole();
		})
	);	

	context.subscriptions.push(
		vscode.commands.registerCommand('gfvscode.stats', function(){
			functions.showStats();
		})
	);	

	context.subscriptions.push(
		vscode.commands.registerCommand('gfvscode.generateDoc', function(){
			functions.generateDoc();
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('gfvscode.migrateDocs', function(){
			functions.migrateDocs();
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('gfvscode.createWar', function(){
			functions.createWar();
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('gfvscode.addProxy', function(){
			functions.addProxy(false);
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('gfvscode.addProxyWithUser', function(){
			functions.addProxy(true);
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('gfvscode.clearProxy', function(){
			functions.clearProxy();
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('gfvscode.removeProxy', function(){
			functions.removeProxy();
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('gfvscode.setProxy', function(){
			functions.setProxy();
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('gfvscode.createDomainClass', function(){
			functions.createDomainClass();
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('gfvscode.createController', function(){
			functions.createController();
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('gfvscode.createService', function(){
			functions.createService();
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('gfvscode.createFilter', function(){
			functions.createService();
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('gfvscode.createInterceptor', function(){
			functions.createInterceptor();
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('gfvscode.createHibernateCfg', function(){
			functions.createHibernateCfgXML();
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('gfvscode.createScript', function(){
			functions.createScript();
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('gfvscode.createTaglib', function(){
			functions.createTagLib();
		})
	);
	
	context.subscriptions.push(
		vscode.commands.registerCommand('gfvscode.createUnitTest', function(){
			functions.createUnitTest();
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('gfvscode.createIntegrationTest', function(){
			functions.createIntegrationTest();
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('gfvscode.createPOM', function(){
			functions.createPOM();
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('gfvscode.generateViews', function(){
			functions.generateViews();
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('gfvscode.generateControllers', function(){
			functions.generateControllers();
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('gfvscode.generateAll', function(){
			functions.generateAll();
		})
	);

	if(functions.checkIfIsAGrailsProject() != null){
		functions.defineAppProperties();
	}	
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
