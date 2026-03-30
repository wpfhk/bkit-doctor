#!/usr/bin/env node
'use strict';

const { Command } = require('commander');
const { versionCommand } = require('./commands/version');
const { checkCommand }   = require('./commands/check');
const { initCommand }    = require('./commands/init');
const { fixCommand }     = require('./commands/fix');
const { presetListCommand, presetShowCommand, presetRecommendCommand } = require('./commands/preset');
const { saveCommand }    = require('./commands/save');
const { loadCommand }    = require('./commands/load');
const { pdcaCommand }    = require('./commands/pdca');
const pkg = require('../../package.json');

const program = new Command();

program
  .name('bkit-doctor')
  .description('bkit 운영 환경 진단 CLI')
  .version(pkg.version, '-v, --version', '버전 출력');

program
  .command('version')
  .description('버전 및 플랫폼 정보 출력')
  .action(versionCommand);

program
  .command('check')
  .description('bkit 운영 환경 진단 실행')
  .option('-p, --path <dir>', '진단 대상 디렉터리', process.cwd())
  .action(checkCommand);

program
  .command('init')
  .description('bkit .claude/ 환경 초기화')
  .option('-p, --path <dir>',        '초기화 대상 디렉터리', process.cwd())
  .option('--dry-run',               '파일 변경 없이 계획만 출력')
  .option('--overwrite',             '기존 파일 덮어쓰기 허용')
  .option('--backup',                'overwrite 전 백업 수행')
  .option('--backup-dir <dir>',      '백업 저장 디렉터리 (기본: .bkit-doctor/backups)')
  .option('--target <name>',         '특정 target만 생성 (반복 사용 가능)', collect, [])
  .option('--targets <list>',        '쉼표 구분 target 목록 (예: hooks-json,skills-core)')
  .option('--recommended',           '현재 프로젝트 상태 기반 추천 target 자동 적용')
  .option('--preset <name>',         '사전 정의 preset으로 target 번들 적용 (예: default, lean, docs)')
  .option('--fresh',                 '--recommended / fix 시 snapshot 무시하고 재계산')
  .option('-y, --yes',               '확인 prompt 생략 (자동 진행)')
  .action(initCommand);

program
  .command('fix')
  .description('recommendation 기반 자동 적용 (check → recommend → init)')
  .option('-p, --path <dir>',  '진단 대상 디렉터리', process.cwd())
  .option('--dry-run',         '파일 변경 없이 계획만 출력')
  .option('--fresh',           'snapshot 무시하고 재계산')
  .option('-y, --yes',         '확인 prompt 생략 (자동 진행)')
  .action(fixCommand);

const preset = program
  .command('preset')
  .description('preset 조회 (list / show / recommend)')
  .addHelpCommand(false);

// preset은 내부 개념으로 유지 — 기본 help에서 숨김
preset.configureHelp({ sortSubcommands: false });

preset
  .command('list')
  .description('사용 가능한 preset 목록 표시')
  .action(presetListCommand);

preset
  .command('show <name>')
  .description('특정 preset 상세 정보 표시')
  .action(presetShowCommand);

preset
  .command('recommend')
  .description('현재 프로젝트 상태 기반 preset 추천')
  .option('-p, --path <dir>', '진단 대상 디렉터리', process.cwd())
  .option('--fresh',          'snapshot 무시하고 재계산')
  .action(presetRecommendCommand);

program
  .command('save')
  .description('bkit-doctor 설정 저장 (local/global/both)')
  .option('-p, --path <dir>',  '프로젝트 루트 디렉터리', process.cwd())
  .option('--local',           'local 설정 파일에 저장 (.bkit-doctor/settings.local.json)')
  .option('--global',          'global 설정 파일에 저장 (~/.bkit-doctor/settings.global.json)')
  .option('--both',            'local + global 둘 다 저장')
  .option('--recommended',     '추천 기반 흐름을 기본값으로 저장')
  .option('--preset <name>',   '특정 preset을 기본값으로 저장')
  .action(saveCommand);

program
  .command('load')
  .description('저장된 bkit-doctor 설정을 현재 프로젝트에 적용')
  .option('-p, --path <dir>',  '프로젝트 루트 디렉터리', process.cwd())
  .option('--local',           'local 설정에서 로드')
  .option('--global',          'global 설정에서 로드하여 현재 프로젝트에 적용')
  .option('--file <path>',     '지정 파일에서 로드하여 현재 프로젝트에 적용')
  .action(loadCommand);

program
  .command('pdca <topic>')
  .description('Generate PDCA guide document')
  .option('-p, --path <dir>',      'project root', process.cwd())
  .option('-o, --output <file>',   'output file path')
  .option('--stdout',              'print output')
  .option('--overwrite',           'overwrite existing file')
  .option('--type <kind>',         'guideline | feature | bugfix | refactor', 'guideline')
  .option('--owner <name>',        'owner name', 'TBD')
  .option('--priority <level>',    'priority level', 'P1')
  .action(pdcaCommand);

function collect(val, prev) { return prev.concat([val]); }

program.parse(process.argv);
