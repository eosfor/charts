param(
    $WorkspaceID
)


$query = @"
AZFWApplicationRule | where TimeGenerated >= ago(3d)
"@

$data = Invoke-AzOperationalInsightsQuery -WorkspaceId $WorkspaceID -Query $query -ErrorAction Stop | Select-Object -ExpandProperty Results

$sourceIpGroups = $data | Group-Object SourceIp

$dataSet = 
foreach ($group in $sourceIpGroups) {
    $source = $group.Name
    $targets = $group.Group | Group-Object DestinationIp, Action

    foreach($target in $targets) {
        [PSCustomObject]@{
            source = $source;
            sourceName = $source
            target = $target.Group[0].DestinationIp
            action = $target.Group[0].Action
            value = $target.Count
        }
    }
}

$dataSet | Export-Csv -Path .\sankeyDataSet.csv