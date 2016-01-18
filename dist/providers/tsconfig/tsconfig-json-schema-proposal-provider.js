var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var json_schema_proposal_provider_1 = require('../../json-schema-proposal-provider');
var path = require('path');
var TsConfigJsonSchemaProposalProvider = (function (_super) {
    __extends(TsConfigJsonSchemaProposalProvider, _super);
    function TsConfigJsonSchemaProposalProvider() {
        _super.call(this, this.loadLocalSchema(path.join(__dirname, './tsconfig-schema.json')));
    }
    TsConfigJsonSchemaProposalProvider.prototype.getFilePattern = function () {
        return 'tsconfig.json';
    };
    return TsConfigJsonSchemaProposalProvider;
})(json_schema_proposal_provider_1.JsonSchemaProposalProvider);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TsConfigJsonSchemaProposalProvider;
