"use strict"
const vscode = require('vscode');
const pr     = require('properties-reader');
const path   = require('path');
const cp     = require('child_process');
//Import constants of extension
const cts    = require('./constants');

let grailsChannel   = vscode.window.createOutputChannel(`Grails`);
let applicationName = '';
let grailsVersion   = '';
let outputFilter    = '';
let infoCatcher     = '';
let createCatcher   = '';
let urlCatcher      = '';
let statusBarItem   = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
let stbarConfig     = [];

function showGrailsChannel() {
  grailsChannel.show();
}

function getWorkspaceDir(){
  return path.resolve(vscode.workspace.workspaceFolders[0].uri.fsPath);
}

function defineAppProperties(){
  let properties  = pr(path.join(getWorkspaceDir(),'application.properties'));
  grailsVersion   = properties.get("app.grails.version");
  applicationName = properties.get("app.name");
}

function setStatusBarItem(status){
  if(status != 'dispose'){
    if     (status == 'create')   stbarConfig = ['Creating Grails App...','#ffffff'];
    else if(status == 'done')     stbarConfig = ['Grails Done...', '#ffffff'];
    else if(status == 'init')     stbarConfig = ['Performing Grails Application Init...','#3331b0'];
    else if(status == 'running')  stbarConfig = ['Grails Application Running...','#3bad3d'];
    else if(status == 'stopping') stbarConfig = ['Stopping Application...','#bd2438'];
    statusBarItem.text  = stbarConfig[0];
    statusBarItem.color = stbarConfig[1];
    statusBarItem.show();
  }else{
    statusBarItem.hide();
  }
}

function createApp(){
  vscode.window.showOpenDialog(cts.optCreateApp).then(folder => {
    if(folder != null && folder.length > 0){
      vscode.window.showInputBox(cts.optInputAppName).then(appName =>{
        if(appName != null && appName.length > 0){
          grailsChannel.show();
          let promise = new Promise(resolve => {
            vscode.window.showInformationMessage(`Creating App '${appName}'...`);
            setStatusBarItem('create');
            let result = cp.exec(`grails create-app ${appName}`, {cwd: folder[0].fsPath});
            result.stdout.on("data", (data) => {
              outputFilter  = data;
              infoCatcher   = outputFilter.match(/\w.+/gi);
              createCatcher = outputFilter.match(/Created Grails Application/gi);
              if(infoCatcher != null){
                grailsChannel.append(`${infoCatcher[0]}\n`);
                if(createCatcher != null){
                  let terminal = vscode.window.createTerminal({cwd: folder[0].fsPath});
                  terminal.sendText(`code -r ${appName}`);
                  terminal.dispose;
                  setStatusBarItem('done');
                }
              }
              resolve();
            });
          });
          return promise;
        }
      });
    }
  });
}

module.exports ={
  showGrailsChannel,
  getWorkspaceDir,
  defineAppProperties,
  setStatusBarItem,
  createApp
}