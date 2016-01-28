var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var file_proposal_provider_1 = require('../../file-proposal-provider');
var matchers_1 = require('../../matchers');
var MATCHER = matchers_1.request().value().path(matchers_1.path().key('files').index());
var TsConfigFileProposalProvider = (function (_super) {
    __extends(TsConfigFileProposalProvider, _super);
    function TsConfigFileProposalProvider() {
        _super.apply(this, arguments);
    }
    TsConfigFileProposalProvider.prototype.getFilePattern = function () {
        return 'tsconfig.json';
    };
    TsConfigFileProposalProvider.prototype.getMatcher = function () {
        return MATCHER;
    };
    return TsConfigFileProposalProvider;
})(file_proposal_provider_1.FileProposalProvider);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TsConfigFileProposalProvider;
