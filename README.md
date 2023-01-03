This is a fork of [OhTheMisery](https://github.com/albarv340/ohthemisery) for
use internally by Monumenta developers. The current intention is to use a
mostly-unmodified copy to view all items under development, including those
that haven't been released yet.

The branch "upstream" will be updated to track the most recent merged commit
from the upstream ohthemisery fork. You can use
[this link](https://github.com/TeamMonumenta/web-items-internal/compare/upstream...main)
to view the delta between this fork and the original upstream contents.

Note this requires creating a file auth.json with the following contents:
{
    "username": "user",
    "password": "pass",
    "apiPath": "items",
    "useAPI": true
}

See the upstream README for info on how to run this code.
