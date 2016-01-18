var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var json_schema_proposal_provider_1 = require('../../json-schema-proposal-provider');
var path = require('path');
var PackageJsonSchemaProposalProvider = (function (_super) {
    __extends(PackageJsonSchemaProposalProvider, _super);
    function PackageJsonSchemaProposalProvider() {
        _super.call(this, this.loadLocalSchema(path.join(__dirname, './package-schema.json')));
    }
    PackageJsonSchemaProposalProvider.prototype.getFilePattern = function () {
        return 'package.json';
    };
    return PackageJsonSchemaProposalProvider;
})(json_schema_proposal_provider_1.JsonSchemaProposalProvider);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PackageJsonSchemaProposalProvider;
