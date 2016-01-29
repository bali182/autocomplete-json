var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var file_proposal_provider_1 = require('../../file-proposal-provider');
var matchers_1 = require('../../matchers');
var MATCHER = matchers_1.or(matchers_1.request().value().path(matchers_1.path().key('files').index()), matchers_1.request().value().path(matchers_1.path().key('exclude').index()));
var TsConfigJsonFileProposalProvider = (function (_super) {
    __extends(TsConfigJsonFileProposalProvider, _super);
    function TsConfigJsonFileProposalProvider() {
        _super.apply(this, arguments);
    }
    TsConfigJsonFileProposalProvider.prototype.getFilePattern = function () {
        return 'tsconfig.json';
    };
    TsConfigJsonFileProposalProvider.prototype.getMatcher = function () {
        return MATCHER;
    };
    return TsConfigJsonFileProposalProvider;
})(file_proposal_provider_1.FileProposalProvider);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TsConfigJsonFileProposalProvider;
